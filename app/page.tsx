"use client"

import { useState, useEffect } from 'react';
import { Expense } from '@/types';
import { ExpenseCard } from '@/components/expense-card';
import { ExpensesTotal } from '@/components/expenses-total';
import { AddExpenseDialog } from '@/components/add-expense-dialog';
import { currentUser } from '@/lib/data';
import { formatDate } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { useGetExpensesQuery, useDeleteExpenseMutation } from '@/app/services/api';

export default function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);

  const [deleteExpense, { isLoading: isDeletingExpense }] = useDeleteExpenseMutation();

  const { data: expensesData, isLoading: isExpensesLoading } = useGetExpensesQuery(undefined);
  console.log("Expenses Data:", expensesData);

  useEffect(() => {
    if (expensesData) {
      const mappedExpenses = expensesData.map((expense: any) => ({
        ...expense,
        id: expense._id,
      }));
      setExpenses(mappedExpenses);
      setIsLoaded(true);
    } else if (!isExpensesLoading) {
      setExpenses([]);
      setIsLoaded(true);
    }
  }, [expensesData, isExpensesLoading]);

  const handleToggleCheck = (id: string, checked: boolean) => {
    setExpenses(
      expenses.map(expense =>
        expense.id === id ? { ...expense, isChecked: checked } : expense
      )
    );

    toast({
      title: checked ? "Expense added to total" : "Expense removed from total",
      description: "Your daily total has been updated",
      duration: 2000,
    });
  };

  const handleToggleAutoAdd = (id: string, autoAdd: boolean) => {
    setExpenses(
      expenses.map(expense =>
        expense.id === id ? { ...expense, autoAdd } : expense
      )
    );

    toast({
      title: autoAdd ? "Auto-add enabled" : "Auto-add disabled",
      description: autoAdd
        ? "This expense will be automatically added daily"
        : "This expense will no longer be automatically added",
      duration: 2000,
    });
  };

  const handleAddExpense = (expense: Expense) => {
    setExpenses([expense, ...expenses]);

    toast({
      title: "New expense added",
      description: `${expense.title} has been added to your expenses`,
      duration: 2000,
    });
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense({ id }).unwrap();
      setExpenses(expenses.filter(expense => expense.id !== id));

      toast({
        title: "Expense deleted",
        description: "The expense has been removed from your list",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error deleting expense",
        description: "Failed to delete the expense. Please try again.",
        duration: 2000,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">{formatDate(new Date())}</p>
        </div>
        <AddExpenseDialog onAddExpense={handleAddExpense} />
      </div>

      <ExpensesTotal
        expenses={expenses}
        currency={currentUser.preferences.currency}
        isLoading={isExpensesLoading}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isExpensesLoading && Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-[160px] rounded-lg border border-border bg-card/50 animate-pulse"
          />
        ))}

        {!isExpensesLoading && expenses.map(expense => (
          <ExpenseCard
            key={expense.id}
            expense={expense}
            onToggleCheck={handleToggleCheck}
            onToggleAutoAdd={handleToggleAutoAdd}
            onDelete={handleDeleteExpense}
            currency={currentUser.preferences.currency}
          />
        ))}

        {isLoaded && expenses.length === 0 && !isExpensesLoading && (
          <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
            <h3 className="text-lg font-medium">No expenses yet here</h3>
            <p className="text-muted-foreground">Add your first expense to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}