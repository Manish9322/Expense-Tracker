import { createSlice } from '@reduxjs/toolkit';
import { expenseCategories } from '@/lib/data'; // Import expenseCategories

const initialState = {
  title: '',
  amount: '',
  description: '',
  autoAdd: false,
  category: expenseCategories[0] || 'General', // Fallback to 'General' if undefined
  newCategory: '',
  showNewCategory: false,
};

const expenseSlice = createSlice({
  name: 'expense',
  initialState,
  reducers: {
    setTitle: (state, action) => {
      state.title = action.payload;
    },
    setAmount: (state, action) => {
      state.amount = action.payload;
    },
    setDescription: (state, action) => {
      state.description = action.payload;
    },
    setAutoAdd: (state, action) => {
      state.autoAdd = action.payload;
    },
    setCategory: (state, action) => {
      state.category = action.payload;
    },
    setNewCategory: (state, action) => {
      state.newCategory = action.payload;
    },
    setShowNewCategory: (state, action) => {
      state.showNewCategory = action.payload;
    },
    resetForm: (state) => {
      state.title = '';
      state.amount = '';
      state.description = '';
      state.autoAdd = false;
      state.category = expenseCategories[0] || 'General';
      state.newCategory = '';
      state.showNewCategory = false;
    },
  },
});

export const {
  setTitle,
  setAmount,
  setDescription,
  setAutoAdd,
  setCategory,
  setNewCategory,
  setShowNewCategory,
  resetForm,
} = expenseSlice.actions;

export default expenseSlice.reducer;