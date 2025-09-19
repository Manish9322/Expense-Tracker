'use client';

import { useDailyWorkflow } from '@/hooks/use-daily-workflow';

/**
 * Component that handles automatic daily workflow triggers
 * Should be included in the root layout to monitor date changes
 */
export function DailyWorkflowManager() {
  useDailyWorkflow();
  
  // This component doesn't render anything, it just runs the hook
  return null;
}