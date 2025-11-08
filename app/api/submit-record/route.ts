import { NextRequest, NextResponse } from 'next/server';
import { clientSDK, publicClient, somniaChain } from '@/lib/somnia-sdk';
import { calculatePerformance, calculateReward, qualifiesForReward } from '@/lib/calculations';
import { encodeAbiParameters, parseAbiParameters, parseUnits, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userAddress, cigaretteCount, dailyLimit, timestamp } = body;

    console.log('📝 SUBMIT RECORD:', { userAddress, cigaretteCount, dailyLimit, timestamp });

    // Validation
    if (!userAddress || cigaretteCount === undefined || !dailyLimit) {
      console.log('❌ Validation failed: Missing fields');
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exceeded limit
    if (cigaretteCount > dailyLimit) {
      console.log('❌ User exceeded limit');
      return NextResponse.json({
        success: false,
        message: 'Daily limit exceeded. No reward today. Keep trying! 💪',
      });
    }

    // Calculate performance score
    const performance = calculatePerformance(cigaretteCount, dailyLimit);
    console.log('📊 Performance calculated:', performance);

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

    console.log('📡 Emitting RecordValidated event...');
    await clientSDK.streams.emitEvents([eventStream]);
    console.log('✅ Event emitted successfully');

    // DIRECT REWARD GRANT (bypassing listener for reliability)
    try {
      if (qualifiesForReward(performance)) {
        console.log('💰 Granting reward directly...');
        
        // Get current player data
        let totalRewards = 0;
        try {
          const playerData = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'getPlayerData',
            args: [userAddress],
          });
          totalRewards = Number(playerData?.totalRewards || 0);
        } catch (error) {
          console.log('No previous data for player');
        }

        // Calculate reward
        const { amount, rank } = calculateReward(performance, totalRewards);
        console.log('💰 Reward calculated:', { amount, rank, performance });

        // Grant reward
        const account = privateKeyToAccount(
          process.env.REWARD_SERVER_PRIVATE_KEY as `0x${string}`
        );
        const walletClient = createWalletClient({
          account,
          chain: somniaChain,
          transport: http(),
        });

        const amountInWei = parseUnits(amount.toString(), 18);
        const hash = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'grantReward',
          args: [userAddress as `0x${string}`, amountInWei, rank],
        });

        console.log('✅ Reward TX sent:', hash);
        
        // Wait for confirmation
        await publicClient.waitForTransactionReceipt({ hash });
        console.log('✅ Reward confirmed!');

        return NextResponse.json({
          success: true,
          message: `Great job! Performance: ${performance}%. Reward granted: ${amount} QUENCH!`,
          performance,
          reward: amount,
          rank,
          transactionHash: hash,
        });
      } else {
        return NextResponse.json({
          success: true,
          message: `Performance: ${performance}%. Keep improving!`,
          performance,
        });
      }
    } catch (rewardError) {
      console.error('❌ Failed to grant reward:', rewardError);
      // Still return success for record submission
      return NextResponse.json({
        success: true,
        message: `Great job! Performance: ${performance}%. Reward processing...`,
        performance,
      });
    }
  } catch (error) {
    console.error('❌ Submit record error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
