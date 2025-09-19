'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DailyLog {
  _id: string;
  date: string;
  expenses: any[];
  totalAmount: number;
}

interface BackfillResult {
  success: boolean;
  message: string;
  data?: {
    logsCreated: number;
    logsSkipped: number;
    details?: any;
  };
  error?: string;
}

export default function UtilityPage() {
  const [backfillResult, setBackfillResult] = useState<BackfillResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<DailyLog[]>([]);

  const runBackfill = async () => {
    setIsLoading(true);
    setBackfillResult(null);
    
    try {
      const response = await fetch('/api/daily-log', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      setBackfillResult(result as BackfillResult);
      
      // Refresh logs after backfill
      await fetchLogs();
    } catch (error) {
      setBackfillResult({
        success: false,
        error: 'Failed to run backfill',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/daily-log');
      const result = await response.json();
      setLogs(result.data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const createTodayLog = async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch('/api/daily-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: today }),
      });

      const result = await response.json();
      setBackfillResult(result as BackfillResult);
      await fetchLogs();
    } catch (error) {
      setBackfillResult({
        success: false,
        error: 'Failed to create daily log',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runDailyWorkflow = async () => {
    setIsLoading(true);
    setBackfillResult(null);
    
    try {
      const response = await fetch('/api/daily-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      setBackfillResult(result as BackfillResult);
      
      // Refresh logs after workflow
      await fetchLogs();
    } catch (error) {
      setBackfillResult({
        success: false,
        error: 'Failed to run daily workflow',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Daily Log Utilities</h1>
        <p className="text-gray-600">Manage and backfill daily expense logs</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Backfill Missing Logs</CardTitle>
            <CardDescription>
              Create daily logs for all past dates that have expenses but no logs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runBackfill} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Running Backfill...' : 'Run Backfill'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Today's Log</CardTitle>
            <CardDescription>
              Manually create a daily log for today's expenses only
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={createTodayLog} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Creating Log...' : 'Create Today\'s Log'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Workflow (Simulate Cron)</CardTitle>
            <CardDescription>
              Create today's log + cleanup expenses (simulates midnight cron job)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runDailyWorkflow} 
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? 'Running Workflow...' : 'Run Daily Workflow'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {backfillResult && (
        <Alert className={backfillResult.success ? 'border-green-500' : 'border-red-500'}>
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">
                {backfillResult.success ? '✅ Success' : '❌ Error'}: {backfillResult.message}
              </p>
              {backfillResult.data && (
                <div className="text-sm">
                  <p>Logs Created: {backfillResult.data.logsCreated}</p>
                  <p>Logs Skipped: {backfillResult.data.logsSkipped}</p>
                  {backfillResult.data.details && (
                    <details className="mt-2">
                      <summary className="cursor-pointer">View Details</summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">
                        {JSON.stringify(backfillResult.data.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Current Daily Logs</CardTitle>
          <CardDescription>
            List of all daily expense logs in the database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchLogs} className="mb-4">
            Refresh Logs
          </Button>
          
          {logs.length > 0 ? (
            <div className="space-y-2">
              {logs.map((log, index) => (
                <div key={log._id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{log.date}</h3>
                    <span className="text-sm text-gray-500">
                      {log.expenses.length} expenses
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Total: ${log.totalAmount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No daily logs found. Run backfill to create them.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}