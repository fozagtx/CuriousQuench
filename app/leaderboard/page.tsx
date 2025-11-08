'use client';

import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RANK_NAMES } from '@/lib/calculations';
import { motion } from 'framer-motion';
import { Trophy, Crown, Medal, Award, Zap } from 'lucide-react';
import { clientSDK } from '@/lib/somnia-sdk';

interface Player {
  address: string;
  totalRewards: string;
  rank: number;
  lastUpdate: number;
}

const RANK_COLORS = {
  0: 'from-gray-400 to-gray-600',
  1: 'from-blue-400 to-blue-600',
  2: 'from-green-400 to-green-600',
  3: 'from-purple-400 to-purple-600',
  4: 'from-yellow-400 to-orange-600',
};

const RANK_ICONS = {
  0: Medal,
  1: Medal,
  2: Award,
  3: Trophy,
  4: Crown,
};

export default function Leaderboard() {
  const { address } = useAccount();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    let subscription: { unsubscribe?: () => void } | undefined;

    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        const data = await response.json();
        
        if (data.players) {
          setPlayers(data.players);
          
          // Find user's position
          if (address) {
            const userIndex = data.players.findIndex(
              (p: Player) => p.address.toLowerCase() === address.toLowerCase()
            );
            setUserRank(userIndex !== -1 ? userIndex + 1 : null);
          }
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    // Subscribe to real-time RewardGranted events using Somnia SDK
    const subscribeToUpdates = async () => {
      try {
        subscription = await clientSDK.streams.subscribe({
          somniaStreamsEventId: 'RewardGranted',
          ethCalls: [],
          onlyPushChanges: false,
          onData: () => {
            // Refresh leaderboard when new rewards are granted
            fetchLeaderboard();
          },
          onError: (error: Error) => {
            console.error('Leaderboard subscription error:', error);
          },
        });
      } catch (error) {
        console.error('Failed to subscribe to updates:', error);
      }
    };

    fetchLeaderboard();
    subscribeToUpdates();

    return () => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, [address]);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getRankBadge = (rank: number) => {
    const Icon = RANK_ICONS[rank as keyof typeof RANK_ICONS];
    const gradient = RANK_COLORS[rank as keyof typeof RANK_COLORS];
    
    return (
      <div className={`flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${gradient} shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    );
  };

  const getPositionMedal = (position: number) => {
    if (position === 1) return <Crown className="w-8 h-8 text-yellow-500 absolute -top-2 -right-2" />;
    if (position === 2) return <Trophy className="w-6 h-6 text-gray-400 absolute -top-1 -right-1" />;
    if (position === 3) return <Trophy className="w-6 h-6 text-amber-700 absolute -top-1 -right-1" />;
    return null;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-8 text-center bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
          🏆 Leaderboard
        </h1>
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-8 text-center bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
          🏆 Leaderboard
        </h1>
      </motion.div>

      {/* User's Rank Card */}
      {address && userRank && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="mb-6 border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Zap className="w-5 h-5" />
                Your Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-blue-600">#{userRank}</div>
                  <div>
                    <div className="text-2xl font-bold">{formatAddress(address)}</div>
                    <div className="text-sm text-muted-foreground">
                      Rank: {RANK_NAMES[players[userRank - 1]?.rank || 0]}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {parseFloat(players[userRank - 1]?.totalRewards || '0').toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">$QUENCH</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* No Players State */}
      {players.length === 0 && (
        <Card>
          <CardContent className="py-20 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl text-muted-foreground">No players yet. Be the first to join!</p>
          </CardContent>
        </Card>
      )}

      {/* Top 3 Podium */}
      {players.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-center text-2xl flex items-center justify-center gap-2">
                <Crown className="w-6 h-6 text-yellow-600" />
                Top 3 Champions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {/* 2nd Place */}
                {players[1] && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="order-1 md:order-1"
                  >
                    <div className="relative bg-white dark:bg-gray-900 rounded-lg p-6 text-center border-2 border-gray-300 shadow-lg">
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gray-400 text-white px-4 py-1 rounded-full text-sm font-bold">
                        #2
                      </div>
                      <div className="mt-4 mb-4 flex justify-center">
                        {getRankBadge(players[1].rank)}
                      </div>
                      <div className="text-lg font-bold mb-2">{formatAddress(players[1].address)}</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Rank: {RANK_NAMES[players[1].rank]}
                      </div>
                      <div className="text-2xl font-bold text-gray-600">
                        {parseFloat(players[1].totalRewards).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">$QUENCH</div>
                    </div>
                  </motion.div>
                )}

                {/* 1st Place */}
                {players[0] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="order-2 md:order-2"
                  >
                    <div className="relative bg-white dark:bg-gray-900 rounded-lg p-6 text-center border-4 border-yellow-400 shadow-2xl transform md:scale-110">
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full text-base font-bold shadow-lg">
                        👑 #1
                      </div>
                      <div className="mt-6 mb-4 flex justify-center">
                        {getRankBadge(players[0].rank)}
                      </div>
                      <div className="text-xl font-bold mb-2">{formatAddress(players[0].address)}</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Rank: {RANK_NAMES[players[0].rank]}
                      </div>
                      <div className="text-3xl font-bold text-yellow-600">
                        {parseFloat(players[0].totalRewards).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">$QUENCH</div>
                    </div>
                  </motion.div>
                )}

                {/* 3rd Place */}
                {players[2] && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="order-3 md:order-3"
                  >
                    <div className="relative bg-white dark:bg-gray-900 rounded-lg p-6 text-center border-2 border-amber-700 shadow-lg">
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-700 text-white px-4 py-1 rounded-full text-sm font-bold">
                        #3
                      </div>
                      <div className="mt-4 mb-4 flex justify-center">
                        {getRankBadge(players[2].rank)}
                      </div>
                      <div className="text-lg font-bold mb-2">{formatAddress(players[2].address)}</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Rank: {RANK_NAMES[players[2].rank]}
                      </div>
                      <div className="text-2xl font-bold text-amber-700">
                        {parseFloat(players[2].totalRewards).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">$QUENCH</div>
                    </div>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Full Leaderboard */}
      {players.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">All Players</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {players.map((player, index) => {
                  const isCurrentUser = address && player.address.toLowerCase() === address.toLowerCase();
                  
                  return (
                    <motion.div
                      key={player.address}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.8 + index * 0.05 }}
                      className={`relative flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                        isCurrentUser
                          ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 shadow-lg'
                          : 'bg-white dark:bg-gray-900 border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      {getPositionMedal(index + 1)}
                      
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`text-2xl font-bold w-12 text-center ${
                          index < 3 ? 'text-yellow-600' : 'text-muted-foreground'
                        }`}>
                          #{index + 1}
                        </div>
                        
                        <div className="flex-shrink-0">
                          {getRankBadge(player.rank)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-mono font-semibold">
                              {formatAddress(player.address)}
                            </div>
                            {isCurrentUser && (
                              <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                                YOU
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Rank: <span className={`font-semibold bg-gradient-to-r ${RANK_COLORS[player.rank as keyof typeof RANK_COLORS]} bg-clip-text text-transparent`}>
                              {RANK_NAMES[player.rank]}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {parseFloat(player.totalRewards).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">$QUENCH</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
