'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ROUTES } from '@/shared/constants/routes'

// ─── Slide Data ───────────────────────────────────────────────────────────────
// Each slide has its own title, subtitle, CTA buttons, and background image.
const slides = [
  {
    id: 1,
    title: "Discover.\nGet Discovered.",
    subtitle:
      "Discover your next obsession, or become someone else's. SoundCloud is the only community where fans and artists come together.",
    artist: "DC the Don",
    badge: "SoundCloud Artist Pro",
    bg: "/slide1.jpg",
    // Slide 1: listener-facing — shows "Upload" + "Explore Go+"
    buttons: [
      { label: "Upload", href: ROUTES.REGISTER, primary: true },
      { label: "Explore Go+", href: ROUTES.REGISTER, primary: false },
    ],
  },
  {
    id: 2,
    title: "It all starts with\nan upload.",
    subtitle:
      "From bedrooms and broom closets to studios and stadiums, SoundCloud is where you define what's next in music. Just hit upload.",
    artist: "1900Rugrat",
    badge: "Ascending Artist",
    bg: "/slide2.jpg",
    // Slide 2: artist-facing — shows "Upload" + "Explore Artist Pro"
    buttons: [
      { label: "Upload", href: ROUTES.REGISTER, primary: true },
      { label: "Explore Artist Pro", href: ROUTES.LOGIN, primary: false },
    ],
  },
  {
    id: 3,
    title: "Where every music\nscene lives.",
    subtitle:
      "Discover 400 million songs, remixes and DJ sets: every chart-topping track you can find elsewhere, and millions more you can't find anywhere else.",
    artist: "Crayon",
    badge: "Ascending Artist",
    bg: "/slide2.jpg", // reuse until a third image is available
    // Slide 3: listener-facing again — shows "Upload" + "Explore Go+"
    buttons: [
      { label: "Upload", href: ROUTES.REGISTER, primary: true },
      { label: "Explore Go+", href: ROUTES.REGISTER, primary: false },
    ],
  },
]

const AUTO_PLAY_INTERVAL = 5000 // ms between auto-slides

export default function HeroSlider() {
  const [current, setCurrent] = useState(0)

  // ─── Auto-play ────────────────────────────────────────────────────────────
  // Every AUTO_PLAY_INTERVAL ms, move to the next slide automatically.
  // When the user clicks a dot we reset the timer by clearing and restarting.
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, AUTO_PLAY_INTERVAL)

    // Cleanup: stop the timer when the component unmounts or re-renders
    return () => clearInterval(timer)
  }, [current]) // reset timer whenever `current` changes (dot click)

  return (
    <section className="hero-banner relative mx-auto max-w-[1240px] h-[450px] overflow-hidden rounded-md text-white">

      {/* ── Background Image (fades between slides) ── */}
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out brightness-75"
          style={{
            backgroundImage: `url(${slide.bg})`,
            opacity: idx === current ? 1 : 0,
          }}
        />
      ))}

      {/* ── Navbar inside the hero (logo + Sign in / Create account / For Artists) ── */}
      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-5">
        {/* Logo */}
        <Link href={ROUTES.HOME} className="flex items-center gap-2">
          <svg width="26" height="26" viewBox="0 0 32 32" fill="white" aria-label="SoundCloud">
            <path d="M1.28 21.76a3.2 3.2 0 106.4 0v-6.4a3.2 3.2 0 00-6.4 0v6.4zM8.96 21.76a3.2 3.2 0 106.4 0v-9.6a3.2 3.2 0 00-6.4 0v9.6zM16.64 21.76a3.2 3.2 0 106.4 0V8.96a3.2 3.2 0 00-6.4 0v12.8zM24.32 21.76a3.2 3.2 0 106.4 0V6.4a3.2 3.2 0 00-6.4 0v15.36z" />
          </svg>
          <span className="text-white font-bold text-base tracking-tight hidden sm:block">SoundCloud</span>
        </Link>

        {/* Auth buttons */}
        <div className="flex items-center gap-2">
          <Link
            href={ROUTES.LOGIN}
            className="text-white text-sm font-semibold px-4 py-1.5 rounded-sm border border-white/60 hover:bg-white/10 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href={ROUTES.REGISTER}
            className="bg-[#ff5500] hover:bg-[#e64d00] text-white text-sm font-bold px-4 py-1.5 rounded-sm transition-colors"
          >
            Create account
          </Link>
          <Link
            href={ROUTES.LOGIN}
            className="text-white text-sm font-semibold px-4 py-1.5 rounded-sm border border-white/60 hover:bg-white/10 transition-colors hidden md:block"
          >
            For Artists
          </Link>
        </div>
      </nav>

      {/* ── Slide Content ── */}
      <div className="relative z-10 px-12 h-full flex flex-col justify-center">
        {/* Title (key forces re-render animation) */}
        <h1
          key={`title-${current}`}
          className="text-5xl md:text-6xl font-extrabold leading-tight mb-5 whitespace-pre-line animate-fadeIn"
        >
          {slides[current].title}
        </h1>

        {/* Subtitle */}
        <p
          key={`sub-${current}`}
          className="max-w-sm text-sm md:text-base mb-8 opacity-90 leading-relaxed animate-fadeIn"
        >
          {slides[current].subtitle}
        </p>

        {/* CTA Buttons — different for each slide */}
        <div className="flex items-center gap-4">
          {slides[current].buttons.map((btn) =>
            btn.primary ? (
              <Link
                key={btn.label}
                href={btn.href}
                className="bg-white text-black text-sm font-bold px-5 py-2 rounded-sm hover:bg-gray-100 transition-colors"
              >
                {btn.label}
              </Link>
            ) : (
              <Link
                key={btn.label}
                href={btn.href}
                className="text-white text-sm font-semibold hover:underline underline-offset-4 transition-all"
              >
                {btn.label}
              </Link>
            )
          )}
        </div>
      </div>

      {/* ── Slide Dots ── */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`w-3 h-3 rounded-full border-2 border-white transition-all ${
              current === index ? 'bg-white scale-110' : 'bg-transparent opacity-60 hover:opacity-100'
            }`}
          />
        ))}
      </div>

      {/* ── Artist Credit (Bottom Right) ── */}
      <div className="absolute bottom-10 right-10 text-right z-20 leading-tight">
        <p className="font-bold text-sm">{slides[current].artist}</p>
        <p className="text-xs text-gray-300">{slides[current].badge}</p>
      </div>
    </section>
  )
}