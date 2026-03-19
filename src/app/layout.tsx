import type { Metadata } from 'next'
import { Providers } from './providers'
import './globals.scss'

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
        </Providers>
      </body>
    </html>
  )
}
