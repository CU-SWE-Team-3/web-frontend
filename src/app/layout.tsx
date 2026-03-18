import type { ReactNode } from "react";
import "./globals.scss";
import Providers from "./providers";
import HeaderNav from "./header-nav";

export const metadata = {
  title: "BioBeats",
  description: "BioBeats – your music, organised.",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen bg-[var(--sc-bg)] text-white selection:bg-[var(--sc-primary)] selection:text-white">
            <header className="border-b border-white/5 bg-[var(--sc-surface-1)] sticky top-0 z-50">
              <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center gap-6">
                <h1 className="text-2xl font-black tracking-tighter text-white uppercase flex items-center gap-2">
                  <span className="text-orange-500">Bio</span>Beats
                </h1>
                <HeaderNav />
              </div>
            </header>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
