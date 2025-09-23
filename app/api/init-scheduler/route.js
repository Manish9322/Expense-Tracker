/**
 * Scheduler Initialization API Route
 * Call this endpoint to start internal scheduling when self-hosting
 */
import { NextResponse } from "next/server";
import scheduler from "../../services/scheduler.js";

export async function POST() {
  try {
    // Only initialize if internal cron is enabled
    if (process.env.ENABLE_INTERNAL_CRON === 'true') {
      scheduler.startDailyLogJob();
      
      return NextResponse.json({
        success: true,
        message: "Internal scheduler initialized and started",
        status: scheduler.getJobsStatus()
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "Internal cron is disabled. Set ENABLE_INTERNAL_CRON=true to enable.",
        note: "For Vercel deployments, use vercel.json cron configuration instead"
      });
    }

  } catch (error) {
    console.error("[API] Error initializing scheduler:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to initialize scheduler",
      message: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    info: "POST to this endpoint to initialize internal scheduler",
    enabled: process.env.ENABLE_INTERNAL_CRON === 'true',
    note: "Only needed for self-hosted environments"
  });
}