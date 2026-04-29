import type { Metadata } from 'next'
import { Providers } from './providers'
import './globals.scss'

import { GlobalAudioEngine } from '@/features/player/ui/player/GlobalAudioEngine'
import { PremiumAdBanner } from '@/shared/ui/PremiumAdBanner/PremiumAdBanner'

export const metadata: Metadata = {
  title: 'BioBeats',
  description: 'SoundCloud Clone',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#111] text-white antialiased">
        <Providers>
          {children}
          <GlobalAudioEngine />
          <PremiumAdBanner />
        </Providers>
      </body>
    </html>
  )
}
