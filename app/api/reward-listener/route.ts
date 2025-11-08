import { NextResponse } from 'next/server';
import { getServerSDK, publicClient, somniaChain } from '@/lib/somnia-sdk';
import { calculateReward, qualifiesForReward } from '@/lib/calculations';
import { parseUnits, createWalletClient, http, decodeAbiParameters, parseAbiParameters } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';

let isListening = false;

export async function GET() {
  if (isListening) {
    return NextResponse.json({ message: 'Already listening' });
  }

  try {
    const serverSDK = getServerSDK();
    isListening = true;

    // Get wallet client for writing to contract
    const account = privateKeyToAccount(
      process.env.REWARD_SERVER_PRIVATE_KEY as `0x${string}`
    );
    const walletClient = createWalletClient({
      account,
      chain: somniaChain,
      transport: http(),
    });

    // Subscribe to validated records
    const subscription = await serverSDK.streams.subscribe({
      somniaStreamsEventId: 'RecordValidated',
      ethCalls: [],
      onlyPushChanges: false,
      onData: async (event: any) => {
        // Decode event data
        const [userAddress, cigaretteCount, dailyLimit, performance, timestamp] = decodeAbiParameters(
          parseAbiParameters('address, uint256, uint256, uint256, uint256'),
          event.data
        );

        const performanceScore = Number(performance);
        console.log('📥 Received event:', { userAddress, performance: performanceScore });

        // Check if user qualifies for reward
        if (!qualifiesForReward(performanceScore)) {
          console.log('❌ User does not qualify');
          return;
        }

        // Get player data from contract
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
          console.error('Failed to read player data:', error);
        }

        // Calculate reward amount and rank
        const { amount, rank } = calculateReward(performanceScore, totalRewards);

        console.log('💰 Granting reward:', { amount, rank, to: userAddress });

        // Grant reward via smart contract
        const amountInWei = parseUnits(amount.toString(), 18);

        try {
          const hash = await walletClient.writeContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'grantReward',
            args: [userAddress, amountInWei, rank],
          });

          console.log('✅ Reward granted! TX:', hash);
        } catch (error) {
          console.error('Failed to grant reward:', error);
        }
      },
      onError: (error: Error) => {
        console.error('Subscription error:', error);
      },
    });

    return NextResponse.json({
      message: 'Reward server started',
      subscription: 'active',
    });
  } catch (error) {
    console.error('Reward listener error:', error);
    isListening = false;
    return NextResponse.json(
      { error: 'Failed to start listener' },
      { status: 500 }
    );
  }
}
