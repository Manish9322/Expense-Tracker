"use client";

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAddExpenseMutation } from '../app/services/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PlusCircle, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  setTitle,
  setAmount,
  setDescription,
  setAutoAdd,
  setCategory,
  setNewCategory,
  setShowNewCategory,
  resetForm,
} from '@/app/Slices/NewExpenseSlice';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { expenseCategories } from '@/lib/data';
import {Expense} from '@/types';

type AddExpenseDialogProps = {
  onAddExpense: (expense: Expense) => void;
};

export function AddExpenseDialog({onAddExpense }: AddExpenseDialogProps) {
  const dispatch = useDispatch();
  const {
    title,
    amount,
    description,
    autoAdd,
    category,
    newCategory,
    showNewCategory,
  } = useSelector((state : any) => state.expense);
  const [open, setOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [addExpense, { isLoading, error }] = useAddExpenseMutation();

  const handleSubmit = async (e : any) => {
    e.preventDefault();
    toast({
      title: 'Expense added',
      description: `${title} has been added to your expenses.`,
      duration: 2000,
    });

    if (!title || !amount) return;

    const expense = {
      title,
      amount: parseFloat(amount),
      description,
      autoAdd,
      isChecked: true,
      category: showNewCategory ? newCategory : category,
    };

    try {
      await addExpense(expense).unwrap();
      dispatch(resetForm());
      setOpen(false);
      setQuickOpen(false);
    } catch (err) {
      console.error('Failed to add expense:', err);
    }
  };

  const QuickAddForm = () => {
  // Use local state for Quick Add form
  const [quickTitle, setQuickTitle] = useState('');
  const [quickAmount, setQuickAmount] = useState('');
  const [quickDescription, setQuickDescription] = useState('');
  const [quickCategory, setQuickCategory] = useState('');
  const [quickNewCategory, setQuickNewCategory] = useState('');
  const [quickShowNewCategory, setQuickShowNewCategory] = useState(false);

  const handleQuickSubmit = async (e: any) => {
    e.preventDefault();
    if (!quickTitle || !quickAmount) return;
    toast({
      title: 'Quick expense added',
      description: `${quickTitle} has been added to your expenses.`,
      duration: 2000,
    });

    const expense = {
      title: quickTitle,
      amount: parseFloat(quickAmount),
      description: quickDescription,
      autoAdd: false,
      isChecked: true,
      category: quickShowNewCategory ? quickNewCategory : quickCategory,
    };

    try {
      await addExpense(expense).unwrap();
      setQuickTitle('');
      setQuickAmount('');
      setQuickDescription('');
      setQuickCategory('');
      setQuickNewCategory('');
      setQuickShowNewCategory(false);
      setQuickOpen(false);
    } catch (err) {
      console.error('Failed to add expense:', err);
    }
  };

  return (
    <Dialog open={quickOpen} onOpenChange={setQuickOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleQuickSubmit} autoComplete="off">
          <DialogHeader>
            <DialogTitle>Quick Add Expense</DialogTitle>
            <DialogDescription>
              Quickly add a new expense to your tracker.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="quick-title">Title</Label>
              <Input
                id="quick-title"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="e.g., Coffee"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quick-amount">Amount</Label>
              <Input
                id="quick-amount"
                type="number"
                step="0.01"
                min="0"
                value={quickAmount}
                onChange={(e) => setQuickAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quick-description">Description</Label>
              <Input
                id="quick-description"
                value={quickDescription}
                onChange={(e) => setQuickDescription(e.target.value)}
                placeholder="e.g., Morning coffee at Starbucks"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quick-category">Category</Label>
              {!quickShowNewCategory ? (
                <Select
                  value={quickCategory}
                  onValueChange={(value) => {
                    if (value === 'new') {
                      setQuickShowNewCategory(true);
                    } else {
                      setQuickCategory(value);
                    }
                  }}
                >
                  <SelectTrigger id="quick-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                    <SelectItem value="new">+ Add New Category</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={quickNewCategory}
                  onChange={(e) => setQuickNewCategory(e.target.value)}
                  placeholder="Enter new category"
                  required
                />
              )}
            </div>
          </div>
          <DialogFooter>
            {quickShowNewCategory && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setQuickShowNewCategory(false)}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="gap-2 w-full sm:w-auto">
            <PlusCircle className="h-4 w-4" />
            New Expense
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
              <DialogDescription>
                Create a new expense to track your spending.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => dispatch(setTitle(e.target.value))}
                  placeholder="e.g., Coffee, Lunch, Transport"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => dispatch(setAmount(e.target.value))}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                {!showNewCategory ? (
                  <Select
                    value={category}
                    onValueChange={(value) => {
                      if (value === 'new') {
                        dispatch(setShowNewCategory(true));
                      } else {
                        dispatch(setCategory(value));
                      }
                    }}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                      <SelectItem value="new">+ Add New Category</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={newCategory}
                    onChange={(e) => dispatch(setNewCategory(e.target.value))}
                    placeholder="Enter new category"
                    required
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="auto-add"
                  checked={autoAdd}
                  onCheckedChange={(checked) => dispatch(setAutoAdd(checked))}
                />
                <Label htmlFor="auto-add">
                  Auto-add this expense every day
                </Label>
              </div>
            </div>
            <DialogFooter>
              {showNewCategory && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => dispatch(setShowNewCategory(false))}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Expense'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Button
        size="sm"
        variant="secondary"
        className="gap-2 w-full sm:w-auto"
        onClick={() => setQuickOpen(true)}
      >
        <Plus className="h-4 w-4" />
        Quick Add
      </Button>

      <QuickAddForm />
    </div>
  );
}