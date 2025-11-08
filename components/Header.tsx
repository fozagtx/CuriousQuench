'use client';

import WalletConnect from './WalletConnect';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Trophy, Shield } from 'lucide-react';
import { useAccount } from 'wagmi';

export default function Header() {
  const pathname = usePathname();
  const { address } = useAccount();
  const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.toLowerCase();
  const isAdmin = address && ADMIN_ADDRESS && address.toLowerCase() === ADMIN_ADDRESS;

  return (
    <div className="w-full pt-6 px-6">
      <header className="max-w-5xl mx-auto bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border rounded-xl shadow-sm">
        <div className="flex justify-between items-center px-6 py-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 transition-transform group-hover:scale-110">
              <Image
                src="/logo.png"
                alt="Curious Quench Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1 className="scroll-m-20 text-xl font-bold tracking-tight text-blue-600 group-hover:text-blue-700 transition-colors">
              Curious Quench
            </h1>
          </Link>

          <nav className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                pathname === '/dashboard' ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/leaderboard"
              className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-yellow-600 ${
                pathname === '/leaderboard' ? 'text-yellow-600' : 'text-gray-600'
              }`}
            >
              <Trophy className="w-4 h-4" />
              Leaderboard
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-purple-600 ${
                  pathname === '/admin' ? 'text-purple-600' : 'text-gray-600'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}
            <WalletConnect />
          </nav>
        </div>
      </header>
    </div>
  );
}
