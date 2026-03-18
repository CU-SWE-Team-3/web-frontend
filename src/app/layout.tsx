import type { Metadata } from 'next';
import '@/shared/ui/tokens/globals.scss'; // Ensure global styles and tokens are loaded

export const metadata: Metadata = {
  title: 'BioBeats',
  description: 'SoundCloud Clone User Profile',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#111] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
