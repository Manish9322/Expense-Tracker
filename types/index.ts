export interface Expense {
  id: string;
  _id: string;
  title: string;
  amount: number;
  autoAdd: boolean;
  isChecked: boolean;
  category?: string;
  createdAt: string;
}

export interface ExpenseLog {
  id: string;
  date: string;
  expenses: Expense[];
  totalAmount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  currency: string;
  notifications: boolean;
  autoAddBehavior: 'daily' | 'weekdays' | 'weekends' | 'custom';
  theme: 'light' | 'dark' | 'system';
}