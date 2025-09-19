import cron from 'node-cron';

/**
 * Daily Expense Log Cron Service
 * Automatically creates daily expense logs at midnight
 */
class DailyLogCronService {
  constructor() {
    this.isRunning = false;
    this.task = null;
  }

  /**
   * Start the cron job
   * Runs daily at midnight (00:00) to create expense logs
   */
  start() {
    if (this.isRunning) {
      console.log('[Cron Service] Daily log cron job is already running');
      return;
    }

    try {
      // Schedule task to run every day at midnight (00:00)
      // Cron format: second minute hour day month dayOfWeek
      // '0 0 0 * * *' = At 00:00:00 every day
      this.task = cron.schedule('0 0 0 * * *', async () => {
        await this.createDailyLog();
      }, {
        scheduled: true,
        timezone: 'Asia/Kolkata' // Indian timezone, adjust as needed
      });

      this.isRunning = true;
      console.log('[Cron Service] Daily expense log cron job started successfully');
      console.log('[Cron Service] Job will run daily at midnight (00:00 IST)');
      
    } catch (error) {
      console.error('[Cron Service] Failed to start daily log cron job:', error);
      throw error;
    }
  }

  /**
   * Stop the cron job
   */
  stop() {
    if (this.task) {
      this.task.stop();
      this.task = null;
      this.isRunning = false;
      console.log('[Cron Service] Daily log cron job stopped');
    }
  }

  /**
   * Create daily expense log by calling the API endpoint
   */
  async createDailyLog() {
    try {
      console.log('[Cron Service] Executing daily expense log creation and cleanup...');
      
      const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
      
      // Step 1: Create daily log for TODAY's expenses BEFORE cleanup
      // When cron runs at midnight (00:00 Sept 20), we want to log Sept 19's expenses
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const targetDate = yesterday.toISOString().split("T")[0];
      
      console.log(`[Cron Service] Creating log for yesterday: ${targetDate}`);
      
      const logResponse = await fetch(`${baseUrl}/api/daily-log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: targetDate })
      });

      const logResult = await logResponse.json();

      if (logResponse.ok) {
        console.log('[Cron Service] Daily log created successfully:', logResult.message);
        console.log('[Cron Service] Log details:', logResult.data);
      } else {
        console.error('[Cron Service] Failed to create daily log:', logResult.error);
        // Continue with cleanup even if log creation failed
      }

      // Step 2: Cleanup expenses after log creation
      console.log('[Cron Service] Starting expense cleanup...');
      
      const cleanupResponse = await fetch(`${baseUrl}/api/cleanup-daily`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: targetDate })
      });

      const cleanupResult = await cleanupResponse.json();

      if (cleanupResponse.ok) {
        console.log('[Cron Service] Cleanup completed successfully:', cleanupResult.message);
        console.log('[Cron Service] Cleanup details:', cleanupResult.data);
      } else {
        console.error('[Cron Service] Failed to cleanup expenses:', cleanupResult.error);
      }

      console.log('[Cron Service] Daily workflow completed');

    } catch (error) {
      console.error('[Cron Service] Error during daily workflow:', error);
    }
  }

  /**
   * Manually trigger daily log creation (for testing)
   */
  async triggerManual() {
    console.log('[Cron Service] Manually triggering daily log creation...');
    await this.createDailyLog();
  }

  /**
   * Get current status of the cron job
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      nextExecution: this.task ? this.task.nextDate() : null,
      timezone: 'Asia/Kolkata'
    };
  }
}

// Create a singleton instance
const dailyLogCronService = new DailyLogCronService();

export default dailyLogCronService;