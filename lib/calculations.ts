export function calculatePerformance(cigaretteCount: number, dailyLimit: number): number {
  if (cigaretteCount === 0) return 100; // Perfect day
  if (cigaretteCount >= dailyLimit) return 0; // Exceeded limit
  return Math.round(((dailyLimit - cigaretteCount) / dailyLimit) * 100);
}

export function calculateReward(performance: number, totalRewards: number = 0) {
  let amount = 0;
  let rank = 0;

  if (performance >= 90) {
    amount = 100; // 100 $QUENCH
    rank = 4; // S rank
  } else if (performance >= 70) {
    amount = 75;
    rank = 3; // A rank
  } else if (performance >= 50) {
    amount = 50;
    rank = 2; // B rank
  } else if (performance >= 30) {
    amount = 25;
    rank = 1; // C rank
  } else if (performance > 0) {
    amount = 10;
    rank = 0; // D rank
  } else {
    return { amount: 0, rank: 0 }; // No reward
  }

  // Loyalty bonus: 20% extra for users with 1000+ total rewards
  if (totalRewards > 1000) {
    amount = Math.floor(amount * 1.2);
  }

  return { amount, rank };
}

export const RANK_NAMES = ['D', 'C', 'B', 'A', 'S'];

export function qualifiesForReward(performance: number): boolean {
  return performance > 0; // Must be below daily limit
}
