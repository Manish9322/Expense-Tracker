"use client";

import './globals.css';
import '@fontsource-variable/inter';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import Sidebar from '@/components/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { DailyWorkflowManager } from '@/components/daily-workflow-manager';
import { Provider } from 'react-redux';
import store from '../app/services/store';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="font-sans">
      <body className="font-sans antialiased">
        <Provider store={store}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <DailyWorkflowManager />
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 p-4 sm:p-6 md:p-8 pt-6 w-full">{children}</main>
            </div>
            <Toaster />
          </ThemeProvider>
        </Provider>
      </body>
    </html>
  );
}