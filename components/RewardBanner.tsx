'use client';

import { useRewardSubscription } from '@/hooks/useRewardSubscription';
import { RANK_NAMES } from '@/lib/calculations';
import { formatUnits } from 'viem';

export default function RewardBanner() {
  const { latestReward, showBanner, setShowBanner } = useRewardSubscription();

  if (!showBanner || !latestReward) return null;

  return (
    <div className="fixed top-20 right-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-lg shadow-xl border border-white/20 max-w-sm animate-slide-in z-50">
      <button
        onClick={() => setShowBanner(false)}
        className="absolute top-2 right-2 text-white hover:text-white/80 transition-colors h-6 w-6 rounded-full hover:bg-white/10 flex items-center justify-center"
        aria-label="Close"
      >
        ✕
      </button>

      <div className="flex items-start gap-4">
        <div className="text-4xl">🎉</div>
        <div className="flex-1">
          <h3 className="scroll-m-20 text-lg font-semibold tracking-tight mb-2">
            Reward Earned!
          </h3>
          <p className="text-sm font-medium leading-none mb-2 bg-white/20 rounded-md px-2 py-1 inline-block">
            +{formatUnits(BigInt(latestReward.amount), 18)} $QUENCH
          </p>
          <p className="text-xs text-white/90 font-medium">
            New Rank: {RANK_NAMES[latestReward.rank]}
          </p>
        </div>
      </div>
    </div>
  );
}
