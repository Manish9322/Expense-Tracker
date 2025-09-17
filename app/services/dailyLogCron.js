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
      console.log('[Cron Service] Executing daily expense log creation...');
      
      const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/daily-log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        console.log('[Cron Service] Daily log created successfully:', result.message);
        console.log('[Cron Service] Log details:', result.data);
      } else {
        console.error('[Cron Service] Failed to create daily log:', result.error);
      }

    } catch (error) {
      console.error('[Cron Service] Error during daily log creation:', error);
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