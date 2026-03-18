import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: "SoundCloud \u2014 Hear the world's sounds",
  description: 'Discover and stream music, podcasts, and playlists from artists you love.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {/* Providers wraps everything so TanStack Query works app-wide */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
