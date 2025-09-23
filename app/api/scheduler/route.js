import { NextResponse } from "next/server";
import scheduler from "../../services/scheduler.js";

/**
 * GET - Get scheduler status
 */
export async function GET() {
  try {
    const status = scheduler.getJobsStatus();
    
    return NextResponse.json({
      success: true,
      scheduler: {
        enabled: process.env.ENABLE_INTERNAL_CRON === 'true' || process.env.NODE_ENV === 'production',
        jobs: status,
        timezone: 'Asia/Kolkata'
      }
    }, { status: 200 });

  } catch (error) {
    console.error("[API] Error getting scheduler status:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to get scheduler status",
      message: error.message
    }, { status: 500 });
  }
}

/**
 * POST - Control scheduler (start/stop jobs)
 */
export async function POST(request) {
  try {
    const { action, job } = await request.json();

    switch (action) {
      case 'start':
        if (job === 'daily-log') {
          scheduler.startDailyLogJob();
          return NextResponse.json({
            success: true,
            message: "Daily log job started"
          });
        }
        break;

      case 'stop':
        if (job) {
          scheduler.stopJob(job);
        } else {
          scheduler.stopAllJobs();
        }
        return NextResponse.json({
          success: true,
          message: job ? `Job ${job} stopped` : "All jobs stopped"
        });

      case 'restart':
        scheduler.stopAllJobs();
        scheduler.startDailyLogJob();
        return NextResponse.json({
          success: true,
          message: "Scheduler restarted"
        });

      default:
        return NextResponse.json({
          success: false,
          error: "Invalid action. Use 'start', 'stop', or 'restart'"
        }, { status: 400 });
    }

  } catch (error) {
    console.error("[API] Error controlling scheduler:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to control scheduler",
      message: error.message
    }, { status: 500 });
  }
}