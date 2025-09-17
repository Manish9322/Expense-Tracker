import { Expense, ExpenseLog, User } from '@/types';

// Sample data for development
export const initialExpenses: Expense[] = [
  {
    id: '1',
    _id: '1',
    title: 'Coffee',
    amount: 5.5,
    autoAdd: true,
    isChecked: true,
    category: 'Food & Drinks',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    _id: '2',
    title: 'Lunch',
    amount: 12.75,
    autoAdd: false,
    isChecked: false,
    category: 'Food & Drinks',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    _id: '3',
    title: 'Transport',
    amount: 2.5,
    autoAdd: true,
    isChecked: true,
    category: 'Transportation',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    _id: '4',
    title: 'Gym Membership',
    amount: 25,
    autoAdd: true,
    isChecked: true,
    category: 'Health',
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    _id: '5',
    title: 'Movie Tickets',
    amount: 15,
    autoAdd: false,
    isChecked: false,
    category: 'Entertainment',
    createdAt: new Date().toISOString(),
  },
];

export const expenseLogs: ExpenseLog[] = [
  {
    id: '1',
    date: '2023-09-01',
    expenses: initialExpenses.filter(e => e.isChecked || e.autoAdd),
    totalAmount: initialExpenses
      .filter(e => e.isChecked || e.autoAdd)
      .reduce((sum, expense) => sum + expense.amount, 0),
  },
  {
    id: '2',
    date: '2023-08-31',
    expenses: initialExpenses.filter(e => e.autoAdd),
    totalAmount: initialExpenses
      .filter(e => e.autoAdd)
      .reduce((sum, expense) => sum + expense.amount, 0),
  },
];

export const currentUser: User = {
  id: '1',
  name: 'Manish Sonawane',
  email: 'manish@gmail.com',
  preferences: {
    currency: 'INR',
    notifications: true,
    autoAddBehavior: 'daily',
    theme: 'system',
  },
};

// Helper functions to manipulate data
export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Get expenses for a specific date
export const getExpensesForDate = (date: string): Expense[] => {
  const log = expenseLogs.find(log => log.date === date);
  return log ? log.expenses : [];
};

// Get total amount for checked expenses
export const getTotalCheckedAmount = (expenses: Expense[]): number => {
  return expenses
    .filter(expense => expense.isChecked)
    .reduce((sum, expense) => sum + expense.amount, 0);
};

// Categories for expenses
export const expenseCategories = [
  'Food & Drinks',
  'Transportation',
  'Housing',
  'Entertainment',
  'Health',
  'Shopping',
  'Utilities',
  'Travel',
  'Education',
  'Other',
];