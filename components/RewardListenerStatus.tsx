'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Power, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function RewardListenerStatus() {
  const [status, setStatus] = useState<'checking' | 'active' | 'inactive'>('checking');
  const [starting, setStarting] = useState(false);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/reward-status');
      const data = await response.json();
      setStatus(data.isRunning ? 'active' : 'inactive');
    } catch (error) {
      console.error('Failed to check reward listener status:', error);
      setStatus('inactive');
    }
  };

  const startListener = async () => {
    setStarting(true);
    try {
      const response = await fetch('/api/reward-listener', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setStatus('active');
      }
    } catch (error) {
      console.error('Failed to start reward listener:', error);
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => {
    checkStatus();
    
    // Auto-start if inactive
    const autoStart = async () => {
      const response = await fetch('/api/reward-status');
      const data = await response.json();
      if (!data.isRunning) {
        console.log('Auto-starting reward listener...');
        await startListener();
      }
    };
    
    autoStart();

    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (status === 'checking') {
    return null;
  }

  return (
    <Card className={`mb-6 border-2 ${status === 'active' ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'}`}>
      <CardContent className="py-2 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {status === 'active' ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-sm font-bold text-green-800 dark:text-green-200">
                  ✅ Reward System Active - Automatically granting rewards
                </p>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <p className="text-sm font-bold text-yellow-800 dark:text-yellow-200">
                  ⚠️ Reward System Inactive - Start to enable rewards
                </p>
              </>
            )}
          </div>
          
          {status === 'inactive' && (
            <Button 
              onClick={startListener} 
              disabled={starting}
              size="sm"
              variant="outline"
              className="border-yellow-600 text-yellow-600 hover:bg-yellow-100"
            >
              {starting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Power className="mr-2 h-4 w-4" />
                  Start Now
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
