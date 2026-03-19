'use client';

import React from 'react';
import Link from 'next/link';
import { NavBar } from '@/shared/ui';
import { ROUTES } from '@/shared/constants/routes';

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col">
      <NavBar />
      
      {/* Dummy Feed Layout */}
      <main className="flex-1 p-6 max-w-[1240px] mx-auto w-full pt-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Hear the latest posts from the people you’re following:</h1>
        </div>

        <div className="text-[#999] text-center mt-20">
          <p className="text-lg">This is a mock feed page for testing UI navigation.</p>
          <p className="text-sm mt-3">Click on your user avatar or "Profile" from the navigation dropdown (or just type <Link href={ROUTES.PROFILE('testuser')} className="text-[#ff5500] hover:underline">/profile/testuser</Link>) to test the new Profile Page layout.</p>
        </div>
      </main>
    </div>
  );
}
