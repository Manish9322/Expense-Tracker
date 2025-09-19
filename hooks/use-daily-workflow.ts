import { useEffect, useRef } from 'react';

/**
 * Custom hook to handle daily workflow when date changes
 * Automatically triggers daily log creation and cleanup on new day
 */
export const useDailyWorkflow = () => {
  const lastDateRef = useRef<string | null>(null);

  useEffect(() => {
    const checkDateChange = () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Get last stored date from localStorage
      const lastStoredDate = localStorage.getItem('lastVisitDate');
      
      // If this is a new day or first visit
      if (lastStoredDate && lastStoredDate !== today) {
        console.log(`[Daily Workflow] New day detected. Last visit: ${lastStoredDate}, Today: ${today}`);
        
        // Trigger daily workflow for the previous day
        triggerDailyWorkflow(lastStoredDate);
      }
      
      // Update stored date
      localStorage.setItem('lastVisitDate', today);
      lastDateRef.current = today;
    };

    const triggerDailyWorkflow = async (previousDate: string) => {
      try {
        console.log(`[Daily Workflow] Triggering workflow for ${previousDate}`);
        
        const response = await fetch('/api/daily-workflow', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ date: previousDate }),
        });

        const result = await response.json();
        
        if (result.success) {
          console.log(`[Daily Workflow] Successfully completed workflow for ${previousDate}`);
        } else {
          console.error(`[Daily Workflow] Workflow failed for ${previousDate}:`, result);
        }
      } catch (error) {
        console.error('[Daily Workflow] Error triggering workflow:', error);
      }
    };

    // Check on mount
    checkDateChange();

    // Set up interval to check every minute (in case user keeps app open past midnight)
    const interval = setInterval(checkDateChange, 60000);

    return () => clearInterval(interval);
  }, []);

  return {
    triggerManualWorkflow: async (date?: string) => {
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      try {
        const response = await fetch('/api/daily-workflow', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ date: targetDate }),
        });

        return await response.json();
      } catch (error) {
        console.error('[Daily Workflow] Error in manual trigger:', error);
        throw error;
      }
    }
  };
};