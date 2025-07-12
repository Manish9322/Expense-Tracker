import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { expenseApi } from '../services/api.js';
import expenseSlice from '../Slices/NewExpenseSlice.js';

const store = configureStore({
  reducer: {
    expense: expenseSlice,
    [expenseApi.reducerPath]: expenseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(expenseApi.middleware),
});

setupListeners(store.dispatch);

export default store;