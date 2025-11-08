import { NextRequest, NextResponse } from 'next/server';
import { clientSDK } from '@/lib/somnia-sdk';
import { calculatePerformance } from '@/lib/calculations';
import { encodeAbiParameters, parseAbiParameters } from 'viem';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userAddress, cigaretteCount, dailyLimit, timestamp } = body;

    // Validation
    if (!userAddress || cigaretteCount === undefined || !dailyLimit) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exceeded limit
    if (cigaretteCount > dailyLimit) {
      return NextResponse.json({
        success: false,
        message: 'Daily limit exceeded. No reward today. Keep trying! 💪',
      });
    }

    // Calculate performance score
    const performance = calculatePerformance(cigaretteCount, dailyLimit);

    // Emit event for reward server to process
    const eventData = encodeAbiParameters(
      parseAbiParameters('address userAddress, uint256 cigaretteCount, uint256 dailyLimit, uint256 performance, uint256 timestamp'),
      [userAddress as `0x${string}`, BigInt(cigaretteCount), BigInt(dailyLimit), BigInt(performance), BigInt(timestamp)]
    );

    const eventStream = {
      id: 'RecordValidated',
      argumentTopics: [userAddress as `0x${string}`],
      data: eventData,
    };

    await clientSDK.streams.emitEvents([eventStream]);

    return NextResponse.json({
      success: true,
      message: `Great job! Performance: ${performance}%. Reward processing...`,
      performance,
    });
  } catch (error) {
    console.error('Submit record error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
