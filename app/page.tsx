// app/page.tsx — SoundCloud Clone Landing Page
// This is the very first page users see.
// It matches the SoundCloud homepage screenshot with:
//  1. Announcement banner (top)
//  2. Navigation bar (logo + Sign in / Create account)
//  3. Hero slider (background image + text)
//  4. Search bar + Upload CTA
//  5. "Trending" section header

import Link from 'next/link'
import HeroSlider from './components/Register/HeroSlider'
import { ROUTES } from '@/shared/constants/routes'
import { SearchIcon } from '@/shared/ui'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#111111] text-white font-[var(--font-inter)]">

      {/* ── Hero Slider (includes its own navbar) ──────────────────────── */}
      {/* The navbar with Sign in / Create account / For Artists is built    */}
      {/* INSIDE HeroSlider.tsx so it overlays on top of the background image */}
      <div className="px-4 pt-4 pb-2 max-w-[1240px] mx-auto">
        <HeroSlider />
      </div>

      {/* ── 4. Search Bar + Upload CTA ──────────────────────────────────── */}
      <div className="flex items-center justify-center gap-4 px-4 py-6 max-w-[800px] mx-auto mt-2">
        {/* Search input */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search for artists, bands, tracks, podcasts"
            className="w-full h-10 pl-4 pr-10 bg-[#333] text-white text-sm rounded-sm outline-none focus:bg-[#444] placeholder:text-gray-400 transition-colors"
          />
          {/* Search icon */}
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
            <SearchIcon size={18} />
          </button>
        </div>

        <span className="text-gray-400 text-sm font-medium shrink-0">or</span>

        {/* Upload CTA */}
        <Link
          href={ROUTES.REGISTER}
          className="shrink-0 px-6 h-10 flex items-center bg-white text-black text-sm font-bold rounded-sm hover:bg-gray-100 transition-colors"
        >
          Upload your own
        </Link>
      </div>

      {/* ── 5. Trending Section ─────────────────────────────────────────── */}
      <div className="text-center py-8 px-4 max-w-[1240px] mx-auto">
        <h2 className="text-white text-2xl font-medium mb-8">
          Hear what&apos;s trending for free in the SoundCloud community
        </h2>
        
        {/* Track Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-left mb-10">
          {[
            { img: "https://placehold.co/200x200/222/FFF?text=Track+1", title: "RIDE RIDE Produced By Ki...", artist: "Kid Cudi" },
            { img: "https://placehold.co/200x200/333/FFF?text=Track+2", title: "Falling Forever (Hard Edit) ...", artist: "AMMARA" },
            { img: "https://placehold.co/200x200/444/FFF?text=Track+3", title: "Rusty Nails", artist: "ABELLA" },
            { img: "https://placehold.co/200x200/555/FFF?text=Track+4", title: "you ready?", artist: "Nettspend" },
            { img: "https://placehold.co/200x200/666/FFF?text=Track+5", title: "Your Loving Arms (FREE DL)", artist: "Phase Two" },
            { img: "https://placehold.co/200x200/777/FFF?text=Track+6", title: "Pradabagshawty - Yerk Wa...", artist: "Prada Hub" }
          ].map((track, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="relative aspect-square mb-2 bg-[#222] overflow-hidden rounded-sm shadow-md">
                <img src={track.img} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <div className="w-12 h-12 bg-[#ff5500] hover:bg-[#e64d00] rounded-full flex items-center justify-center pl-1 shadow-lg transition-colors">
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                   </div>
                </div>
              </div>
              <h3 className="text-white text-sm font-medium truncate hover:text-[#ff5500] transition-colors">{track.title}</h3>
              <p className="text-[#999] text-xs truncate mt-0.5 hover:text-[#ccc] transition-colors">{track.artist}</p>
            </div>
          ))}
        </div>

        <Link href={ROUTES.REGISTER} className="inline-flex items-center justify-center px-6 h-11 bg-white text-black text-sm font-bold rounded-md hover:bg-gray-100 transition-colors">
          Explore trending playlists
        </Link>
      </div>

      {/* ── 6. Mobile Devices Section ───────────────────────────────────── */}
      <div className="bg-[#f2f2f2] text-black border-t border-[#e5e5e5]">
        <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row items-center justify-between px-8 py-16 gap-10">
          <div className="flex-1 relative h-[300px] md:h-[400px] w-full flex justify-center">
            {/* Devices Placeholder */}
            <div className="absolute w-[80%] h-full bg-[url('https://placehold.co/600x400/ddd/999?text=Devices+Image')] bg-contain bg-center bg-no-repeat rounded-lg shadow-xl" />
          </div>
          <div className="flex-1 max-w-md">
            <h2 className="text-3xl md:text-4xl font-medium mb-6">Never stop listening</h2>
            <div className="w-12 h-1 bg-gradient-to-r from-[#FF3300] to-[#FF7700] mb-6"></div>
            <p className="text-lg mb-8 leading-relaxed opacity-90">
              SoundCloud is available on Web, iOS, Android, Sonos, Chromecast, and Xbox One.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-black text-white px-4 py-2 rounded-md flex items-center gap-3 hover:bg-gray-800 transition">
                <div className="w-6 h-6 bg-[url('https://upload.wikimedia.org/wikipedia/commons/3/31/Apple_logo_white.svg')] bg-contain bg-center bg-no-repeat" />
                <div className="text-left flex flex-col justify-center h-full">
                  <span className="text-[10px] leading-none text-gray-300">Download on the</span>
                  <span className="text-sm font-semibold leading-none mt-1">App Store</span>
                </div>
              </button>
              <button className="bg-black text-white px-4 py-2 rounded-md flex items-center gap-3 hover:bg-gray-800 transition">
                <div className="w-6 h-6 bg-[url('https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Play_Arrow_logo.svg')] bg-contain bg-center bg-no-repeat" />
                <div className="text-left flex flex-col justify-center h-full">
                  <span className="text-[10px] leading-none text-gray-300">GET IT ON</span>
                  <span className="text-sm font-semibold leading-none mt-1">Google Play</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 7. Creator Section ──────────────────────────────────────────── */}
      <div className="bg-black text-white relative h-[350px] md:h-[400px] overflow-hidden flex items-center border-t border-[#333]">
        {/* Collage Placeholder */}
        <div className="absolute right-0 top-0 bottom-0 w-[60%] bg-[url('https://placehold.co/800x400/111/444?text=Creator+Collage')] bg-cover bg-left"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent"></div>
        
        <div className="relative z-10 max-w-[1240px] mx-auto w-full px-8 md:px-16">
          <div className="max-w-md">
            <h2 className="text-3xl md:text-5xl font-medium mb-6">Calling all creators</h2>
            <p className="text-lg md:text-xl opacity-90 mb-8 leading-relaxed">
              Get on SoundCloud to connect with fans, share your sounds, and grow your audience. What are you waiting for?
            </p>
            <Link href={ROUTES.REGISTER} className="inline-flex items-center justify-center px-6 h-11 bg-white text-black text-sm font-bold rounded-sm hover:bg-gray-100 transition-colors">
              Find out more
            </Link>
          </div>
        </div>
      </div>

      {/* ── 8. Bottom Signup Section ────────────────────────────────────── */}
      <div className="bg-[#111111] text-white py-24 px-4 text-center border-b border-[#333]">
        <h2 className="text-3xl md:text-4xl font-medium mb-6">Thanks for listening. Now join in.</h2>
        <p className="text-lg md:text-xl opacity-90 mb-8 font-light">Save tracks, follow artists and build playlists. All for free.</p>
        <Link href={ROUTES.REGISTER} className="inline-flex items-center justify-center px-8 h-12 bg-[#ff5500] text-white text-base font-bold rounded-sm hover:bg-[#e64d00] transition-colors mb-6 shadow-lg shadow-[#ff5500]/20">
          Create account
        </Link>
        <p className="text-sm text-gray-300 font-medium mt-2">
          Already have an account?{' '}
          <Link href={ROUTES.LOGIN} className="text-white hover:text-white border-b border-white/30 hover:border-white pb-0.5 transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      {/* ── 9. Footer ─────────────────────────────────────────────────── */}
      <footer className="bg-[#111111] py-8 px-8 text-xs font-semibold text-[#999]">
        <div className="max-w-[1240px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2">
              {['Directory', 'About us', 'Artist Resources', 'Newsroom', 'Topics', 'Jobs', 'Developers', 'Help', 'Legal', 'Privacy', 'Cookie Policy', 'Cookie Manager', 'Imprint', 'Charts', 'Transparency Reports'].map(link => (
                <a key={link} href="#" className="hover:text-[#ccc] border-b border-transparent hover:border-[#ccc] transition-colors pb-0.5">{link}</a>
              ))}
            </div>
            <div className="text-[#0066cc] cursor-pointer hover:underline font-bold shrink-0">
              Language: English (US)
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
