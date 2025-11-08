import { NextResponse } from 'next/server';
import { publicClient } from '@/lib/somnia-sdk';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { formatUnits } from 'viem';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get the latest block number
    const latestBlock = await publicClient.getBlockNumber();
    
    console.log('🔍 Fetching leaderboard. Latest block:', latestBlock.toString());
    
    // Only scan last 10000 blocks for better performance
    const startBlock = latestBlock > 10000n ? latestBlock - 10000n : BigInt(0);
    
    console.log('📊 Scanning from block', startBlock.toString(), 'to', latestBlock.toString());
    
    let allLogs: any[] = [];
    
    // Query logs - try full range first, fallback to chunks if needed
    try {
      const logs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event: {
          type: 'event',
          name: 'RewardGranted',
          inputs: [
            { type: 'address', indexed: true, name: 'player' },
            { type: 'uint256', indexed: false, name: 'amount' },
            { type: 'uint8', indexed: false, name: 'rank' },
          ],
        },
        fromBlock: startBlock,
        toBlock: latestBlock,
      });
      
      allLogs = logs;
      console.log('✅ Found', logs.length, 'RewardGranted events');
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      // If direct fetch fails, try chunking
      const chunkSize = BigInt(1000);
      for (let fromBlock = startBlock; fromBlock <= latestBlock; fromBlock += chunkSize) {
        const toBlock = fromBlock + chunkSize - BigInt(1) > latestBlock 
          ? latestBlock 
          : fromBlock + chunkSize - BigInt(1);
        
        try {
          const logs = await publicClient.getLogs({
            address: CONTRACT_ADDRESS,
            event: {
              type: 'event',
              name: 'RewardGranted',
              inputs: [
                { type: 'address', indexed: true, name: 'player' },
                { type: 'uint256', indexed: false, name: 'amount' },
                { type: 'uint8', indexed: false, name: 'rank' },
              ],
            },
            fromBlock,
            toBlock,
          });
          
          allLogs = [...allLogs, ...logs];
        } catch (chunkError) {
          console.error(`Error fetching logs from ${fromBlock} to ${toBlock}:`, chunkError);
        }
      }
    }
    
    const logs = allLogs;

    // Get unique player addresses
    const playerAddresses = [...new Set(logs.map((log) => log.args.player))].filter(
      (addr): addr is `0x${string}` => addr !== undefined
    );

    // Fetch data for each player from the contract
    const playersData = await Promise.all(
      playerAddresses.map(async (address) => {
        try {
          const data = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'getPlayerData',
            args: [address],
          });

          return {
            address,
            totalRewards: formatUnits(data.totalRewards, 18),
            rank: data.rank,
            lastUpdate: Number(data.lastUpdate),
          };
        } catch (error) {
          console.error(`Error fetching data for ${address}:`, error);
          return null;
        }
      })
    );

    // Filter out null values and sort by total rewards
    const validPlayers = playersData
      .filter((player) => player !== null)
      .sort((a, b) => parseFloat(b.totalRewards) - parseFloat(a.totalRewards));

    return NextResponse.json({ players: validPlayers });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
