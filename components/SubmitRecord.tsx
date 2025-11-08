'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import ProcessingModal from './ProcessingModal';

export default function SubmitRecord() {
  const { address } = useAccount();
  const [cigaretteCount, setCigaretteCount] = useState('');
  const [dailyLimit, setDailyLimit] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    setLoading(true);
    setShowModal(true);

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

      // Keep modal open for 6 seconds (5s processing + 1s success)
      await new Promise(resolve => setTimeout(resolve, 6000));

      setShowModal(false);

      if (data.success) {
        toast.success(data.message, {
          description: `Performance: ${data.performance}%`
        });
        setCigaretteCount('');
      } else {
        toast.warning(data.message);
      }
    } catch (error) {
      setShowModal(false);
      toast.error('Failed to submit record');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ProcessingModal isOpen={showModal} />
      <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Submit Daily Record</CardTitle>
        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
            ⚠️ Rules: Be truthful to your input as it will help you fight your addiction. Let's get healthy together! 💪
          </p>
        </div>
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
            className="w-full"
          >
            {loading ? 'Submitting...' : 'Submit Record'}
          </Button>
        </form>
      </CardContent>
    </Card>
    </>
  );
}
