import { getServerSDK, publicClient, somniaChain } from './somnia-sdk';
import { calculateReward, qualifiesForReward } from './calculations';
import { parseUnits, createWalletClient, http, decodeAbiParameters, parseAbiParameters } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contract';

let isListening = false;
let subscription: any = null;

export async function startRewardListener() {
  if (isListening) {
    console.log('⚠️ Reward listener already running');
    return { success: true, message: 'Already listening' };
  }

  try {
    const serverSDK = getServerSDK();
    
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
    subscription = await serverSDK.streams.subscribe({
      somniaStreamsEventId: 'RecordValidated',
      ethCalls: [],
      onlyPushChanges: false,
      onData: async (event: any) => {
        try {
          // Decode event data
          const [userAddress, cigaretteCount, dailyLimit, performance, timestamp] = decodeAbiParameters(
            parseAbiParameters('address, uint256, uint256, uint256, uint256'),
            event.data
          );

          const performanceScore = Number(performance);
          console.log('📥 Received record:', { 
            userAddress, 
            performance: performanceScore,
            cigarettes: Number(cigaretteCount),
            limit: Number(dailyLimit)
          });

          // Check if user qualifies for reward
          if (!qualifiesForReward(performanceScore)) {
            console.log('❌ User does not qualify for reward');
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

          console.log('💰 Granting reward:', { 
            amount, 
            rank, 
            to: userAddress,
            performance: performanceScore 
          });

          // Grant reward via smart contract
          const amountInWei = parseUnits(amount.toString(), 18);

          const hash = await walletClient.writeContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'grantReward',
            args: [userAddress, amountInWei, rank],
          });

          console.log('✅ Reward granted! TX:', hash);
          
          // Wait for confirmation
          await publicClient.waitForTransactionReceipt({ hash });
          console.log('✅ Transaction confirmed!');
        } catch (error) {
          console.error('❌ Error processing reward:', error);
        }
      },
      onError: (error: Error) => {
        console.error('❌ Subscription error:', error);
        isListening = false;
      },
    });

    isListening = true;
    console.log('✅ Reward listener started successfully');
    
    return { success: true, message: 'Reward server started', subscription: 'active' };
  } catch (error: any) {
    console.error('❌ Failed to start reward listener:', error);
    isListening = false;
    throw error;
  }
}

export function stopRewardListener() {
  if (subscription?.unsubscribe) {
    subscription.unsubscribe();
    subscription = null;
  }
  isListening = false;
  console.log('⏹️ Reward listener stopped');
}

export function isRewardListenerRunning() {
  return isListening;
}
