'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function SubmitRecord() {
  const { address } = useAccount();
  const [cigaretteCount, setCigaretteCount] = useState('');
  const [dailyLimit, setDailyLimit] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    setLoading(true);

    try {
      // Send data to the game server
      const response = await fetch('/api/submit-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: address,
          cigaretteCount: parseInt(cigaretteCount),
          dailyLimit: parseInt(dailyLimit),
          timestamp: Date.now(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message, {
          description: `Performance: ${data.performance}%`
        });
        setCigaretteCount('');
      } else {
        toast.warning(data.message);
      }
    } catch (error) {
      toast.error('Failed to submit record');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Submit Daily Record</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Daily Limit (cigarettes)
            </label>
            <Input
              type="number"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
              required
              min="1"
              placeholder="Enter your daily limit"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Cigarettes Smoked Today
            </label>
            <Input
              type="number"
              value={cigaretteCount}
              onChange={(e) => setCigaretteCount(e.target.value)}
              required
              min="0"
              placeholder="How many today?"
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !address}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Submitting...' : 'Submit Record'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
