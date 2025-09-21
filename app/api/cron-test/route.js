import { NextResponse } from "next/server";

/**
 * Test endpoint to verify cron functionality
 * GET - Check cron status
 * POST - Test cron execution manually
 */
export async function GET() {
  const now = new Date();
  const timeZone = 'Asia/Kolkata';
  const localTime = now.toLocaleString('en-US', { timeZone });
  
  return NextResponse.json({
    success: true,
    message: "Cron test endpoint active",
    data: {
      serverTime: now.toISOString(),
      localTime: localTime,
      timeZone: timeZone,
      environment: process.env.VERCEL_ENV || 'development',
      region: process.env.VERCEL_REGION || 'unknown'
    }
  }, { status: 200 });
}

/**
 * POST - Manually test the daily log creation (simulating cron)
 */
export async function POST() {
  try {
    console.log('[Cron Test] Manual cron simulation started');
    
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    
    // Call the daily log endpoint
    const response = await fetch(`${baseUrl}/api/daily-log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'vercel-cron-test'
      },
      body: JSON.stringify({})
    });

    const result = await response.json();

    console.log('[Cron Test] Manual cron simulation completed:', result);

    return NextResponse.json({
      success: true,
      message: "Cron test completed",
      data: {
        cronResult: result,
        testTime: new Date().toISOString(),
        baseUrl: baseUrl
      }
    }, { status: 200 });

  } catch (error) {
    console.error('[Cron Test] Error during manual cron test:', error);
    
    return NextResponse.json({
      success: false,
      error: "Cron test failed",
      message: error.message
    }, { status: 500 });
  }
}