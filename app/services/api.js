import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const expenseApi = createApi({
  reducerPath: "expenseApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Expenses"],
  endpoints: (builder) => ({
    // ============================ Expenses ============================== //

    getExpenses: builder.query({
      query: () => "/expenses",
      providesTags: ["Expenses"],
    }),
    addExpense: builder.mutation({
      query: (expense) => ({
        url: "/expenses",
        method: "POST",
        body: {
          title: expense.title,
          amount: expense.amount,
          description: expense.description,
          autoAdd: expense.autoAdd,
          isChecked: expense.isChecked,
          category: expense.category,
        },
      }),
      invalidatesTags: ["Expenses"],
    }),

    editExpense: builder.mutation({
      query: (expense) => ({
        url: "/expenses",
        method: "PUT",
        body: expense,
      }),
      invalidatesTags: ["Expenses"],
    }),

    deleteExpense: builder.mutation({
      query: ({ id }) => ({
        url: "/expenses",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["Expenses"],
    }),

    updateExpenseAutoAdd: builder.mutation({
      query: ({ id, autoAdd }) => ({
        url: "/expenses",
        method: "PATCH",
        body: { id, autoAdd },
      }),
      invalidatesTags: ["Expenses"],
    }),

    updateExpenseIsChecked: builder.mutation({
      query: ({ id, isChecked }) => ({
        url: "/expenses",
        method: "PATCH",
        body: { id, isChecked },
      }),
      invalidatesTags: ["Expenses"],
    }),

    // ============================ Daily Expense Logs ============================== //

    getDailyExpenseLogs: builder.query({
      query: () => "/daily-expenses",
      providesTags: ["DailyExpenseLogs"],
    }),
    addDailyExpenseLog: builder.mutation({
      query: (log) => ({
        url: "/daily-expenses",
        method: "POST",
        body: log,
      }),
      invalidatesTags: ["DailyExpenseLogs"],
    }),

    // ========================== Cleanup Daily Expenses ============================ //

    addCleanupDaily: builder.mutation({
      query: () => ({
        url: "/cleanup-daily",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useGetExpensesQuery,
  useAddExpenseMutation,
  useEditExpenseMutation,
  useDeleteExpenseMutation,
  useUpdateExpenseAutoAddMutation,
  useUpdateExpenseIsCheckedMutation,

  useGetDailyExpenseLogsQuery,
  useAddDailyExpenseLogMutation,

  useAddCleanupDailyMutation,
} = expenseApi;
