'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Particles from '@/components/ui/particles';
import AnimatedShinyText from '@/components/ui/animated-shiny-text';

export default function Home() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.push('/dashboard');
    }
  }, [isConnected, router]);

  return (
    <div className="max-w-6xl mx-auto px-6">
      {/* Hero Section */}
      <div className="relative text-center py-20 overflow-hidden">
        <Particles
          className="absolute inset-0 -z-10"
          quantity={200}
          ease={80}
          color="#3b82f6"
          staticity={40}
          size={0.5}
        />

        <div className="relative z-10">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <Image
              src="/logo.png"
              alt="Curious Quench Logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-6xl mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Curious Quench
          </h1>

          <AnimatedShinyText className="text-xl leading-7 max-w-2xl mx-auto mb-8">
            Gamified Web3 journey to quit smoking. Track your progress and earn $QUENCH tokens!
          </AnimatedShinyText>

          {isConnected ? (
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all">
              <Link href="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">Connect your wallet to get started</p>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 py-12">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="text-5xl">📊</div>
              <div>
                <CardTitle className="mb-2">Track Progress</CardTitle>
                <CardDescription>
                  Submit your daily cigarette count and stay accountable to your goals.
                </CardDescription>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="text-5xl">🏆</div>
              <div>
                <CardTitle className="mb-2">Earn Rewards</CardTitle>
                <CardDescription>
                  Get $QUENCH tokens for staying below your daily limit. Ranked from D to S!
                </CardDescription>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="text-5xl">⛓️</div>
              <div>
                <CardTitle className="mb-2">Web3 Powered</CardTitle>
                <CardDescription>
                  Built on Somnia blockchain with transparent, immutable records.
                </CardDescription>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rank System */}
      <Card className="mt-12">
        <CardHeader className="border-b">
          <CardTitle className="text-center text-3xl">Rank System</CardTitle>
        </CardHeader>
        <CardContent>
        <div className="grid md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-gray-100 rounded-lg border">
            <div className="text-2xl font-bold text-gray-600 mb-2">D</div>
            <div className="text-sm font-medium leading-none mb-2">1-29%</div>
            <div className="text-xs text-muted-foreground mt-2">10 $QUENCH</div>
          </div>
          <div className="text-center p-4 bg-blue-100 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600 mb-2">C</div>
            <div className="text-sm font-medium leading-none text-blue-600 mb-2">30-49%</div>
            <div className="text-xs text-blue-600/70 mt-2">25 $QUENCH</div>
          </div>
          <div className="text-center p-4 bg-green-100 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600 mb-2">B</div>
            <div className="text-sm font-medium leading-none text-green-600 mb-2">50-69%</div>
            <div className="text-xs text-green-600/70 mt-2">50 $QUENCH</div>
          </div>
          <div className="text-center p-4 bg-purple-100 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600 mb-2">A</div>
            <div className="text-sm font-medium leading-none text-purple-600 mb-2">70-89%</div>
            <div className="text-xs text-purple-600/70 mt-2">75 $QUENCH</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-600 mb-2">S</div>
            <div className="text-sm font-medium leading-none text-orange-600 mb-2">90-100%</div>
            <div className="text-xs text-orange-600/70 mt-2">100 $QUENCH</div>
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-6 font-mono">
          Performance = (Daily Limit - Cigarettes Smoked) / Daily Limit × 100%
        </p>
        </CardContent>
      </Card>

      {/* How it Works */}
      <div className="py-12">
        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight text-center mb-8">
          How It Works
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold shadow-md">
              1
            </div>
            <h4 className="scroll-m-20 text-lg font-semibold tracking-tight mb-2">Set Your Limit</h4>
            <p className="text-sm text-muted-foreground">Define your daily cigarette limit</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold shadow-md">
              2
            </div>
            <h4 className="scroll-m-20 text-lg font-semibold tracking-tight mb-2">Track Daily</h4>
            <p className="text-sm text-muted-foreground">Submit your count each day</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold shadow-md">
              3
            </div>
            <h4 className="scroll-m-20 text-lg font-semibold tracking-tight mb-2">Earn Rewards</h4>
            <p className="text-sm text-muted-foreground">Get $QUENCH for staying under</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold shadow-md">
              4
            </div>
            <h4 className="scroll-m-20 text-lg font-semibold tracking-tight mb-2">Rank Up</h4>
            <p className="text-sm text-muted-foreground">Climb from D to S rank</p>
          </div>
        </div>
      </div>
    </div>
  );
}
