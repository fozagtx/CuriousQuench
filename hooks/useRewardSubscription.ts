'use client';

import { useEffect, useState } from 'react';
import { clientSDK } from '@/lib/somnia-sdk';
import { useAccount } from 'wagmi';

interface RewardEvent {
  player: string;
  amount: string;
  rank: number;
}

export function useRewardSubscription() {
  const { address } = useAccount();
  const [latestReward, setLatestReward] = useState<RewardEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!address) return;

    let subscription: any;

    const subscribe = async () => {
      try {
        subscription = await clientSDK.streams.subscribe({
          somniaStreamsEventId: 'RewardGranted',
          ethCalls: [],
          onlyPushChanges: false,
          onData: (event: any) => {
            // Filter for current user's rewards
            if (event.player?.toLowerCase() === address.toLowerCase()) {
              setLatestReward({
                player: event.player,
                amount: event.amount,
                rank: event.rank,
              });
              setShowBanner(true);

              // Auto-hide banner after 5 seconds
              setTimeout(() => setShowBanner(false), 5000);
            }
          },
          onError: (error: Error) => {
            console.error('Subscription error:', error);
          },
        });
      } catch (error) {
        console.error('Subscription error:', error);
      }
    };

    subscribe();

    return () => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, [address]);

  return { latestReward, showBanner, setShowBanner };
}
