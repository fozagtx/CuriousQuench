'use client';

import WalletConnect from './WalletConnect';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
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
          <WalletConnect />
        </div>
      </header>
    </div>
  );
}
