"use client"

import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/data';
import { Expense } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ExpensesTotalProps {
  expenses: Expense[];
  currency?: string;
}

export function ExpensesTotal({ expenses, currency = 'USD' }: ExpensesTotalProps) {
  const [total, setTotal] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Calculate total from checked expenses
    const newTotal = expenses
      .filter(expense => expense.isChecked)
      .reduce((sum, expense) => sum + expense.amount, 0);

    if (newTotal !== total) {
      setIsAnimating(true);
      setTotal(newTotal);
      const timeout = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timeout);
    } else {
      setTotal(newTotal);
    }
  }, [expenses]);

  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Today's Total</CardTitle>
        <CardDescription>Sum of checked expenses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold tracking-tight transition-all duration-300">
            <span className={cn(
              isAnimating && 'animate-pulse text-primary'
            )}>
              {formatCurrency(total, currency)}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {expenses.filter(e => e.isChecked).length} items
          </div>
        </div>
      </CardContent>
    </Card>
  );
}