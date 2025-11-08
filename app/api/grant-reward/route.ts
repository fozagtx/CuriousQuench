import { NextRequest, NextResponse } from 'next/server';
import { getServerSDK, publicClient, somniaChain } from '@/lib/somnia-sdk';
import { parseUnits, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { playerAddress, amount, rank } = body;

    // Validation
    if (!playerAddress || amount === undefined || rank === undefined) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: playerAddress, amount, rank' },
        { status: 400 }
      );
    }

    // Validate rank (0-4)
    if (rank < 0 || rank > 4) {
      return NextResponse.json(
        { success: false, message: 'Invalid rank. Must be between 0 and 4' },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Get wallet client for writing to contract
    const account = privateKeyToAccount(
      process.env.REWARD_SERVER_PRIVATE_KEY as `0x${string}`
    );
    const walletClient = createWalletClient({
      account,
      chain: somniaChain,
      transport: http(),
    });

    // Convert amount to wei (18 decimals)
    const amountInWei = parseUnits(amount.toString(), 18);

    console.log('💰 Granting reward:', { 
      playerAddress, 
      amount, 
      rank,
      amountInWei: amountInWei.toString() 
    });

    // Grant reward via smart contract
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'grantReward',
      args: [playerAddress as `0x${string}`, amountInWei, rank],
    });

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    console.log('✅ Reward granted! TX:', hash);

    return NextResponse.json({
      success: true,
      message: 'Reward granted successfully',
      transactionHash: hash,
      blockNumber: receipt.blockNumber.toString(),
    });
  } catch (error: any) {
    console.error('Grant reward error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to grant reward',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
