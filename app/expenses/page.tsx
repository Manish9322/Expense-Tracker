"use client"

import { useState, useEffect } from 'react';
import { formatCurrency, currentUser, expenseCategories } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Expense } from '@/types';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetExpensesQuery, useAddDailyExpenseLogMutation, useAddCleanupDailyMutation, useGetDailyExpenseLogsQuery } from '@/app/services/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, TrendingUp } from 'lucide-react';

export default function DailyExpensesPage() {
  const [currentExpenses, setCurrentExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all-categories');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const { data: expenses, isLoading } = useGetExpensesQuery(undefined);
  const { data: dailyLogs, isLoading: isLoadingDailyLogs } = useGetDailyExpenseLogsQuery(undefined);
  const [addDailyExpenseLog] = useAddDailyExpenseLogMutation();
  const [addCleanupDaily] = useAddCleanupDailyMutation();

  // Filter expenses for the current day, only including isChecked: true
  const filteredExpenses = currentExpenses.filter(expense => {
    const matchesSearch =
      !searchTerm ||
      expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all-categories' || expense.category === selectedCategory;

    const matchesAmount = (() => {
      const min = minAmount ? parseFloat(minAmount) : -Infinity;
      const max = maxAmount ? parseFloat(maxAmount) : Infinity;
      return expense.amount >= min && expense.amount <= max;
    })();

    return matchesSearch && matchesCategory && matchesAmount && expense.isChecked;
  });

  // Calculate total amount for the filtered expenses
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Function to save current expenses as a daily log at midnight
  const saveDailyLog = async () => {
    const checkedExpenses = currentExpenses.filter(expense => expense.isChecked);
    if (checkedExpenses.length === 0) return;

    const today = new Date().toISOString().split('T')[0];
    try {
      await addDailyExpenseLog({
        date: today,
        expenses: checkedExpenses,
        totalAmount: checkedExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      }).unwrap();
      setCurrentExpenses([]); // Clear current expenses after saving
    } catch (error) {
      console.error("Error saving daily expense log:", error);
    }
  };

  // Cleanup daily expenses at midnight
  const cleanupDailyExpenses = async () => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await addCleanupDaily({ date: today }).unwrap();
      setCurrentExpenses([]); // Clear current expenses after cleanup
    } catch (error) {
      console.error("Error cleaning up daily expenses:", error);
    }
  };

  // Check for midnight and save expenses
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      const timeUntilMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0, 0, 0
      ).getTime() - now.getTime();

      const timeout = setTimeout(() => {
        saveDailyLog();
        // Schedule next check for the following midnight
        setTimeout(checkMidnight, 24 * 60 * 60 * 1000);
      }, timeUntilMidnight);

      return () => clearTimeout(timeout);
    };

    checkMidnight();
  }, [currentExpenses]);

  // Load expenses from the database - show all checked expenses regardless of creation date
  useEffect(() => {
    if (expenses) {
      // Map the expenses to ensure they have the correct structure
      const mappedExpenses = expenses.map((expense: any) => ({
        ...expense,
        id: expense._id,
      }));
      setCurrentExpenses(mappedExpenses);
    }
  }, [expenses]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all-categories');
    setMinAmount('');
    setMaxAmount('');
  };

  const hasActiveFilters = searchTerm || selectedCategory !== 'all-categories' || minAmount || maxAmount;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate total amount across all daily logs
  const totalHistoricalAmount = dailyLogs?.data?.reduce((sum: number, log: any) => sum + log.totalAmount, 0) || 0;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Expenses Overview</h1>
        <p className="text-muted-foreground">View current selected expenses and historical daily logs</p>
      </div>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Current Expenses
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Daily Logs History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Refine selected expenses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="category">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-categories">All categories</SelectItem>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <Label htmlFor="min-amount">Min Amount</Label>
                  <Input
                    id="min-amount"
                    type="number"
                    placeholder="Min"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                  />
                </div>

                <div className="flex-1">
                  <Label htmlFor="max-amount">Max Amount</Label>
                  <Input
                    id="max-amount"
                    type="number"
                    placeholder="Max"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            {filteredExpenses.length > 0 ? (
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle>Selected Expenses</CardTitle>
                    <Badge variant="outline" className="font-mono">
                      {formatCurrency(totalAmount, currentUser.preferences.currency)}
                    </Badge>
                  </div>
                  <CardDescription>
                    {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Auto-Add</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExpenses.map(expense => (
                        <TableRow key={expense._id}>
                          <TableCell>
                            <div className={`w-2 h-2 rounded-full ${expense.autoAdd ? 'bg-primary' : 'border border-primary bg-transparent'}`} />
                          </TableCell>
                          <TableCell className="font-medium">{expense.title}</TableCell>
                          <TableCell>
                            {expense.category && (
                              <Badge variant="secondary" className="text-xs">
                                {expense.category}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(expense.amount, currentUser.preferences.currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center p-8">
                <h3 className="text-lg font-medium">No selected expenses</h3>
                <p className="text-muted-foreground">
                  {hasActiveFilters ? "Try adjusting your filters" : "Go to the dashboard and select (check) some expenses to see them here"}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {isLoadingDailyLogs ? (
            <div className="text-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading daily logs...</p>
            </div>
          ) : (
            <>
              {dailyLogs?.data && dailyLogs.data.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Total Historical Expenses</CardTitle>
                      <Badge variant="outline" className="font-mono text-lg px-4 py-2">
                        {formatCurrency(totalHistoricalAmount, currentUser.preferences.currency)}
                      </Badge>
                    </div>
                    <CardDescription>
                      Across {dailyLogs.data.length} day{dailyLogs.data.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}

              <div className="space-y-4">
                {dailyLogs?.data && dailyLogs.data.length > 0 ? (
                  dailyLogs.data.map((log: any) => (
                    <Card key={log._id}>
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-lg">{formatDate(log.date)}</CardTitle>
                            <CardDescription>
                              {log.expenses?.length || 0} expense{(log.expenses?.length || 0) !== 1 ? 's' : ''}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="font-mono">
                            {formatCurrency(log.totalAmount || 0, currentUser.preferences.currency)}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      {log.expenses && log.expenses.length > 0 && (
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Status</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {log.expenses.map((expense: any, index: number) => (
                                <TableRow key={expense._id || index}>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${expense.autoAdd ? 'bg-blue-500' : 'border border-gray-400 bg-transparent'}`} />
                                      {expense.isChecked && (
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-medium">{expense.title}</TableCell>
                                  <TableCell>
                                    {expense.category && (
                                      <Badge variant="secondary" className="text-xs">
                                        {expense.category}
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right font-mono">
                                    {formatCurrency(expense.amount || 0, currentUser.preferences.currency)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      )}
                    </Card>
                  ))
                ) : (
                  <div className="text-center p-8">
                    <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No daily logs found</h3>
                    <p className="text-muted-foreground">
                      Daily logs will automatically be created at midnight each day based on your selected expenses.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}