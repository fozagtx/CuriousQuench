import { NextResponse } from 'next/server';
import { isRewardListenerRunning } from '@/lib/reward-service';

export async function GET() {
  const isRunning = isRewardListenerRunning();
  
  return NextResponse.json({
    success: true,
    isRunning,
    status: isRunning ? 'active' : 'inactive',
    message: isRunning 
      ? 'Reward listener is running' 
      : 'Reward listener is not running. Visit /api/reward-listener to start.'
  });
}
