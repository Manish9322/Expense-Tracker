import cron from 'node-cron';

/**
 * Internal Cron Scheduler
 * This runs server-side and triggers the daily workflow
 * Only use this for self-hosted environments where the server runs 24/7
 */
class CronScheduler {
  constructor() {
    this.jobs = new Map();
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Start the daily expense log cron job
   */
  startDailyLogJob() {
    // Only run in production or when explicitly enabled
    if (!this.isProduction && process.env.ENABLE_INTERNAL_CRON !== 'true') {
      console.log('[SCHEDULER] Internal cron disabled in development');
      return;
    }

    // Schedule for midnight IST (0 0 * * *)
    const job = cron.schedule('0 0 * * *', async () => {
      console.log('[SCHEDULER] Running daily expense log job...');
      
      try {
        // Make internal HTTP request to our API
        const response = await fetch(`${process.env.BASE_URL || 'http://localhost:3000'}/api/daily-log`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'internal-scheduler'
          },
          body: JSON.stringify({})
        });

        if (response.ok) {
          const result = await response.json();
          console.log('[SCHEDULER] Daily log job completed successfully:', result);
        } else {
          console.error('[SCHEDULER] Daily log job failed:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('[SCHEDULER] Error running daily log job:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Asia/Kolkata'
    });

    this.jobs.set('daily-log', job);
    console.log('[SCHEDULER] Daily expense log job scheduled for midnight IST');
  }

  /**
   * Stop a specific job
   */
  stopJob(jobName) {
    const job = this.jobs.get(jobName);
    if (job) {
      job.stop();
      this.jobs.delete(jobName);
      console.log(`[SCHEDULER] Stopped job: ${jobName}`);
    }
  }

  /**
   * Stop all scheduled jobs
   */
  stopAllJobs() {
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`[SCHEDULER] Stopped job: ${name}`);
    });
    this.jobs.clear();
  }

  /**
   * Get status of all jobs
   */
  getJobsStatus() {
    const status = {};
    this.jobs.forEach((job, name) => {
      status[name] = {
        running: job.running || false,
        scheduled: true
      };
    });
    return status;
  }
}

// Create singleton instance
const scheduler = new CronScheduler();

export default scheduler;