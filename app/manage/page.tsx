"use client"

import { useState, useEffect } from 'react';
import { Expense } from '@/types';
import { currentUser, expenseCategories } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import { AddExpenseDialog } from '@/components/add-expense-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  useGetExpensesQuery,
  useEditExpenseMutation,
  useDeleteExpenseMutation,
  useUpdateExpenseAutoAddMutation,
  useUpdateExpenseIsCheckedMutation,
} from '@/app/services/api';

export default function ManageExpensesPage() {
  const { data: expensesData, isLoading } = useGetExpensesQuery(undefined);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [deleteExpense] = useDeleteExpenseMutation();
  const [updateAutoAdd] = useUpdateExpenseAutoAddMutation();
  const [updateIsChecked] = useUpdateExpenseIsCheckedMutation();
  const [editExpense] = useEditExpenseMutation();
  const { toast } = useToast();

  // Sync local state with backend data
  useEffect(() => {
    if (expensesData) {
      setExpenses(expensesData.map((expense: any) => ({
        ...expense,
        id: expense._id,
      })));
    }
  }, [expensesData]);

  // Delete expense
  const handleDelete = async (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id)); // Optimistic update
    try {
      await deleteExpense({ id }).unwrap();
    } catch {
      // Optionally handle error and revert UI
    }
    toast({
      title: "Expense deleted",
      description: "The expense has been removed from your list.",
      duration: 2000,
    });
  };

  // Edit expense (local only, since no backend edit API)
  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;
    try {
      await editExpense(editingExpense).unwrap();
      setIsDialogOpen(false);
      setEditingExpense(null);
      toast({
        title: "Expense updated",
        description: `${editingExpense.title} has been updated.`,
        duration: 2000,
      });
    } catch {
      toast({
        title: "Error updating expense",
        description: "Failed to update the expense. Please try again.",
        duration: 2000,
        variant: "destructive",
      });
    }
  };


  // Add expense (handled by AddExpenseDialog via API, but update local state for instant UI)
  const handleAddExpense = (expense: Expense) => {
    setExpenses([expense, ...expenses]);
    toast({
      title: "Expense added",
      description: `${expense.title} has been added to your expenses.`,
      duration: 2000,
    });
  };

  // Toggle autoAdd
  const handleAutoAddToggle = async (id: string, autoAdd: boolean) => {
    setExpenses(expenses.map(e =>
      e.id === id ? { ...e, autoAdd } : e

    ));
    try {
      await updateAutoAdd({ id, autoAdd }).unwrap();
    } catch {
      // Optionally handle error and revert UI
    }
    toast({
      title: autoAdd ? "Auto-add enabled" : "Auto-add disabled",
      description: autoAdd
        ? "This expense will be automatically added daily"
        : "This expense will no longer be automatically added",
      duration: 2000,
    });
  };

  // Toggle isChecked
  const handleIsCheckedToggle = async (id: string, isChecked: boolean) => {
    setExpenses(expenses.map(e =>
      e.id === id ? { ...e, isChecked } : e
    ));
    try {
      await updateIsChecked({ id, isChecked }).unwrap();
    } catch {
      // Optionally handle error and revert UI
    }
    toast({
      title: isChecked ? "Expense added to total" : "Expense removed from total",
      description: "Your daily total has been updated",
      duration: 2000,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Expenses</h1>
          <p className="text-muted-foreground">Edit and organize your expenses</p>
        </div>
        <AddExpenseDialog onAddExpense={handleAddExpense} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Auto-Add</TableHead>
                <TableHead>Include in Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6}>Loading...</TableCell>
                </TableRow>
              ) : expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.title}</TableCell>
                  <TableCell>
                    {expense.category && (
                      <Badge variant="outline">{expense.category}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatCurrency(expense.amount, currentUser.preferences.currency)}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={expense.autoAdd}
                      onCheckedChange={(checked) => handleAutoAddToggle(expense.id, checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={expense.isChecked}
                      onCheckedChange={(checked) => handleIsCheckedToggle(expense.id, checked)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(expense)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(expense.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editingExpense?.title || ''}
                onChange={(e) => setEditingExpense(prev =>
                  prev ? { ...prev, title: e.target.value } : null
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={editingExpense?.amount || ''}
                onChange={(e) => setEditingExpense(prev =>
                  prev ? { ...prev, amount: parseFloat(e.target.value) } : null
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={editingExpense?.category}
                onValueChange={(value) => setEditingExpense(prev =>
                  prev ? { ...prev, category: value } : null
                )}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="auto-add"
                checked={editingExpense?.autoAdd || false}
                onCheckedChange={(checked) => setEditingExpense(prev =>
                  prev ? { ...prev, autoAdd: checked } : null
                )}
              />
              <Label htmlFor="auto-add">Auto-add this expense daily</Label>
            </div>
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}