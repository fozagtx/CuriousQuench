import { NextResponse } from 'next/server';
import { startRewardListener, isRewardListenerRunning } from '@/lib/reward-service';

export async function GET() {
  if (isRewardListenerRunning()) {
    return NextResponse.json({ 
      success: true,
      message: 'Reward listener already running',
      status: 'active'
    });
  }

  try {
    const result = await startRewardListener();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Reward listener error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to start listener',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
