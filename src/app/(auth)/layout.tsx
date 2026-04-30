import React from 'react';
import Link from 'next/link';
import { ROUTES } from '@/shared/constants/routes';
import { BioBeatsLogo } from '@/shared/ui/Brand';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#111111] flex flex-col">
      <header className="border-b border-[#222] px-6 py-4">
        <Link href={ROUTES.HOME} className="flex items-center gap-2 w-fit">
          <BioBeatsLogo iconSize={32} textSize={20} />
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px]">
          {children}
        </div>
      </main>
      <footer className="border-t border-[#222] px-6 py-4 text-center">
        <p className="text-[#555] text-xs">
          &copy; {new Date().getFullYear()} BioBeats Limited
        </p>
      </footer>
    </div>
  );
}
