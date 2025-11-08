import { NextRequest, NextResponse } from 'next/server';
import { publicClient, somniaChain } from '@/lib/somnia-sdk';
import { parseUnits, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userAddress } = body;

    if (!userAddress) {
      return NextResponse.json(
        { success: false, message: 'Missing userAddress' },
        { status: 400 }
      );
    }

    console.log('🔧 DEBUG: Granting reward to:', userAddress);

    // Get wallet client
    const account = privateKeyToAccount(
      process.env.REWARD_SERVER_PRIVATE_KEY as `0x${string}`
    );
    
    console.log('🔧 DEBUG: Reward server address:', account.address);

    const walletClient = createWalletClient({
      account,
      chain: somniaChain,
      transport: http(),
    });

    // Grant 100 QUENCH with A rank
    const amount = parseUnits('100', 18);
    const rank = 3;

    console.log('🔧 DEBUG: Calling grantReward...', {
      contract: CONTRACT_ADDRESS,
      player: userAddress,
      amount: amount.toString(),
      rank,
    });

    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'grantReward',
      args: [userAddress as `0x${string}`, amount, rank],
    });

    console.log('🔧 DEBUG: TX sent:', hash);

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    console.log('🔧 DEBUG: TX confirmed:', {
      blockNumber: receipt.blockNumber.toString(),
      status: receipt.status,
    });

    // Read updated player data
    const playerData = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'getPlayerData',
      args: [userAddress],
    });

    console.log('🔧 DEBUG: Player data after grant:', playerData);

    return NextResponse.json({
      success: true,
      transactionHash: hash,
      blockNumber: receipt.blockNumber.toString(),
      playerData: {
        totalRewards: playerData.totalRewards.toString(),
        rank: playerData.rank,
        lastUpdate: playerData.lastUpdate.toString(),
      },
    });
  } catch (error: any) {
    console.error('🔧 DEBUG ERROR:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message,
        details: error.details || error.toString()
      },
      { status: 500 }
    );
  }
}
