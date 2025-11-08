'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Coins, CheckCircle, AlertCircle } from 'lucide-react';
import { RANK_NAMES } from '@/lib/calculations';

const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.toLowerCase();

export default function AdminDashboard() {
  const { address } = useAccount();
  const [playerAddress, setPlayerAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [rank, setRank] = useState('0');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isAdmin = address && ADMIN_ADDRESS && address.toLowerCase() === ADMIN_ADDRESS;

  const handleGrantReward = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/grant-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerAddress,
          amount: parseFloat(amount),
          rank: parseInt(rank),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: `Reward granted! TX: ${data.transactionHash.slice(0, 10)}...`,
        });
        setPlayerAddress('');
        setAmount('');
        setRank('0');
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Failed to grant reward',
        });
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'An error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!address) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-red-500">
          <CardContent className="py-20 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-2">Connect Wallet</h2>
            <p className="text-muted-foreground">Please connect your wallet to access the admin dashboard</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-red-500">
          <CardContent className="py-20 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You do not have permission to access this page</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">Grant rewards to players on the Curious Quench platform</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Grant Reward
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGrantReward} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="playerAddress">Player Address</Label>
              <Input
                id="playerAddress"
                type="text"
                placeholder="0x..."
                value={playerAddress}
                onChange={(e) => setPlayerAddress(e.target.value)}
                required
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">The Ethereum address of the player</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Reward Amount (QUENCH)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Amount of QUENCH tokens to grant</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rank">Player Rank</Label>
              <Select value={rank} onValueChange={setRank}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RANK_NAMES.map((rankName, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {rankName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">The player's current rank level</p>
            </div>

            {message && (
              <div
                className={`flex items-center gap-2 p-4 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <Coins className="mr-2 h-4 w-4" />
                  Grant Reward
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6 bg-blue-50 dark:bg-blue-950 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-600">Quick Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Admin Address:</span>
            <span className="font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Reward Server:</span>
            <span className="font-mono">{process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.slice(0, 6)}...{process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.slice(-4)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
