import "./globals.scss";
import { Providers } from "./providers";

export const metadata = {
  title: "SoundCloud - Settings",
  description: "SoundCloud Settings",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* SoundCloud Dark Header */}
        <header className="bg-[#111] h-[46px] flex items-center px-4 border-b border-[#333]">
          <div className="max-w-[1240px] w-full mx-auto flex items-center justify-between">
            {/* Logo + Nav */}
            <div className="flex items-center gap-5">
              {/* SoundCloud waveform logo */}
              <a href="/" className="flex items-center mr-2">
                <svg width="36" height="16" viewBox="0 0 36 16" fill="none">
                  <rect x="0" y="8" width="2" height="8" rx="1" fill="#fff"/>
                  <rect x="4" y="4" width="2" height="12" rx="1" fill="#fff"/>
                  <rect x="8" y="0" width="2" height="16" rx="1" fill="#fff"/>
                  <rect x="12" y="3" width="2" height="13" rx="1" fill="#fff"/>
                  <rect x="16" y="6" width="2" height="10" rx="1" fill="#fff"/>
                  <rect x="20" y="2" width="2" height="14" rx="1" fill="#fff"/>
                  <rect x="24" y="5" width="2" height="11" rx="1" fill="#fff"/>
                  <rect x="28" y="7" width="2" height="9" rx="1" fill="#fff"/>
                </svg>
              </a>

              <nav className="hidden md:flex items-center gap-5">
                <a href="#" className="text-white text-[13px] font-normal hover:text-[#f50] transition-colors">
                  Home
                </a>
                <a href="#" className="text-white text-[13px] font-normal hover:text-[#f50] transition-colors">
                  Feed
                </a>
                <a href="#" className="text-white text-[13px] font-normal hover:text-[#f50] transition-colors">
                  Library
                </a>
              </nav>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-[420px] mx-6 hidden sm:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full bg-[#2a2a2a] text-white text-[13px] rounded-sm px-3 py-[5px] placeholder-[#666] focus:outline-none focus:bg-[#333] border border-transparent focus:border-[#555] transition-all"
                />
                <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <a href="#" className="text-[#f50] text-[13px] font-semibold hover:underline hidden lg:inline">
                Try Artist Pro
              </a>
              <a href="#" className="text-white text-[13px] font-normal hover:text-[#f50] transition-colors hidden md:inline">
                For Artists
              </a>
              <a href="#" className="text-white text-[13px] font-normal hover:text-[#f50] transition-colors hidden sm:inline">
                Upload
              </a>
              {/* User avatar */}
              <div className="w-[26px] h-[26px] rounded-full bg-[#9b59b6] flex items-center justify-center cursor-pointer">
                <span className="text-white text-[11px] font-bold">M</span>
              </div>
              {/* Icons */}
              <div className="flex items-center gap-3 text-[#999]">
                <svg className="w-4 h-4 cursor-pointer hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <svg className="w-4 h-4 cursor-pointer hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <svg className="w-4 h-4 cursor-pointer hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="5" cy="12" r="2"/>
                  <circle cx="12" cy="12" r="2"/>
                  <circle cx="19" cy="12" r="2"/>
                </svg>
              </div>
            </div>
          </div>
        </header>

        {/* Promotional Banner */}
        <div className="bg-[#1a1a2e] border-b border-[#333] py-2.5 px-4">
          <div className="max-w-[1240px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-[13px]">
              <span>✨</span>
              <span className="text-[#ccc]">
                Uploading tracks just got way easier: upload, get heard, and get paid in one seamless experience.
              </span>
              <a href="#" className="text-[#f50] hover:underline ml-1">Try it out</a>
            </div>
            <button className="text-[#999] hover:text-white text-lg leading-none transition-colors">
              ×
            </button>
          </div>
        </div>

        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
