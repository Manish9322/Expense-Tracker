import { NextResponse } from "next/server";

/**
 * Daily Workflow API - Handles both log creation and cleanup
 * POST - Create daily log for today and cleanup expenses
 */
export async function POST(request) {
  try {
    let body = {};
    
    // Safely parse JSON, handle empty body
    try {
      const text = await request.text();
      if (text && text.trim()) {
        body = JSON.parse(text);
      }
    } catch (parseError) {
      console.log('[Daily Workflow] No JSON body provided, using defaults');
      body = {};
    }
    
    const { date } = body;
    
    // Use provided date or default to today
    const targetDate = date || new Date().toISOString().split("T")[0];
    
    console.log(`[Daily Workflow] Starting workflow for ${targetDate}`);
    
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const results = {
      date: targetDate,
      logCreation: null,
      cleanup: null,
      success: true
    };

    // Step 1: Create daily log for the specified date
    try {
      console.log(`[Daily Workflow] Creating log for ${targetDate}`);
      
      const logResponse = await fetch(`${baseUrl}/api/daily-log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: targetDate })
      });

      const logResult = await logResponse.json();
      results.logCreation = logResult;

      if (logResponse.ok) {
        console.log('[Daily Workflow] Log creation successful:', logResult.message);
      } else {
        console.error('[Daily Workflow] Log creation failed:', logResult.error);
        results.success = false;
      }
    } catch (error) {
      console.error('[Daily Workflow] Error during log creation:', error);
      results.logCreation = { error: error.message };
      results.success = false;
    }

    // Step 2: Cleanup expenses (only if log creation succeeded or if we want to force cleanup)
    try {
      console.log('[Daily Workflow] Starting expense cleanup...');
      
      const cleanupResponse = await fetch(`${baseUrl}/api/cleanup-daily`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: targetDate })
      });

      const cleanupResult = await cleanupResponse.json();
      results.cleanup = cleanupResult;

      if (cleanupResponse.ok) {
        console.log('[Daily Workflow] Cleanup successful:', cleanupResult.message);
      } else {
        console.error('[Daily Workflow] Cleanup failed:', cleanupResult.error);
        results.success = false;
      }
    } catch (error) {
      console.error('[Daily Workflow] Error during cleanup:', error);
      results.cleanup = { error: error.message };
      results.success = false;
    }

    console.log(`[Daily Workflow] Workflow completed for ${targetDate}`);
    
    return NextResponse.json({
      success: results.success,
      message: results.success 
        ? `Daily workflow completed successfully for ${targetDate}`
        : `Daily workflow completed with errors for ${targetDate}`,
      data: results
    }, { status: results.success ? 200 : 207 }); // 207 = Multi-Status (partial success)

  } catch (error) {
    console.error("[Daily Workflow] Error during workflow:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to execute daily workflow",
      message: error.message
    }, { status: 500 });
  }
}

/**
 * GET - Get status/info about the daily workflow
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Daily Workflow API - Use POST to trigger workflow",
    endpoints: {
      POST: "Trigger daily log creation and expense cleanup",
      body: {
        date: "Optional: YYYY-MM-DD format, defaults to today"
      }
    }
  }, { status: 200 });
}