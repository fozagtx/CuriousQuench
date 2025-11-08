'use client';

import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import { publicClient } from '@/lib/somnia-sdk';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { RANK_NAMES } from '@/lib/calculations';
import { formatUnits } from 'viem';
import SubmitRecord from '@/components/SubmitRecord';
import RewardBanner from '@/components/RewardBanner';
import RewardListenerStatus from '@/components/RewardListenerStatus';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function Dashboard() {
  const { address } = useAccount();
  const [playerData, setPlayerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;

    const fetchPlayerData = async () => {
      try {
        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'getPlayerData',
          args: [address],
        });

        setPlayerData(data);
      } catch (error) {
        console.error('Error fetching player data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
    const interval = setInterval(fetchPlayerData, 10000); // Refresh every 10s

    return () => clearInterval(interval);
  }, [address]);

  if (!address) {
    return (
      <div className="text-center py-20">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          Connect Your Wallet
        </h1>
        <p className="text-xl text-muted-foreground">
          Please connect to view your dashboard
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <RewardBanner />
      <RewardListenerStatus />

      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-8">
        Your Curious Quench Dashboard
      </h1>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardDescription>Total Rewards</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {loading ? '...' : formatUnits(playerData?.totalRewards || BigInt(0), 18)}
              <span className="text-lg font-semibold ml-2">$QUENCH</span>
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Current Rank</CardDescription>
            <CardTitle className="text-3xl text-cyan-600">
              {loading ? '...' : RANK_NAMES[playerData?.rank || 0]}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Last Update</CardDescription>
            <CardTitle className="text-base font-normal">
              {loading
                ? '...'
                : playerData?.lastUpdate
                ? new Date(Number(playerData.lastUpdate) * 1000).toLocaleDateString()
                : 'No records yet'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Submit Record Form */}
      <SubmitRecord />
    </div>
  );
}
