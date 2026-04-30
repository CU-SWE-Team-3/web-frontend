import type { Metadata, Viewport } from 'next'
import { Providers } from './providers'
import './globals.scss'

import { GlobalAudioEngine } from '@/features/player/ui/player/GlobalAudioEngine'
import { PremiumAdBanner } from '@/shared/ui/PremiumAdBanner/PremiumAdBanner'

export const metadata: Metadata = {
  title: 'BioBeats',
  description: 'BioBeats music platform',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ overflowX: 'hidden' }}>
      <body className="bg-[#111] text-white antialiased" style={{ overflowX: 'hidden' }}>
        <Providers>
          {children}
          <GlobalAudioEngine />
          <PremiumAdBanner />
        </Providers>
      </body>
    </html>
  )
}
