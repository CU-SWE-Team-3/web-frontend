'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/shared/constants/routes';
import { BioBeatsLogo } from '@/shared/ui/Brand';

const slides = [
  {
    title: "Discover.\nGet Discovered.",
    subtitle: "Discover your next obsession, or become someone else's. BioBeats is where fans and artists come together to discover and connect through music.",
    artist: 'BioBeats Studio',
    badge: 'Artist Pro',
    bg: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: "It all starts with\nan upload.",
    subtitle: "From bedrooms and small rooms to studios and stages, BioBeats is where you define what's next.",
    artist: 'Recording Room',
    badge: 'Ascending Artist',
    bg: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1600&q=80',
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      data-testid="hero-slider"
      style={{
        position: 'relative',
        maxWidth: 1240,
        height: 450,
        overflow: 'hidden',
        borderRadius: 8,
        color: '#fff',
        margin: '0 auto',
        background: '#222',
      }}
    >
      {slides.map((slide, i) => (
        <img
          key={slide.bg}
          src={slide.bg}
          alt=""
          data-testid={`hero-slide-image-${i}`}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: current === i ? 1 : 0,
            transition: 'opacity 700ms ease-in-out',
            zIndex: 0,
          }}
        />
      ))}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(0,0,0,0.72), rgba(0,0,0,0.32), rgba(0,0,0,0.08))',
          zIndex: 1,
        }}
      />

      <nav
        data-testid="hero-nav"
        style={{
          position: 'relative',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px 0',
        }}
      >
        <BioBeatsLogo iconSize={28} textSize={18} uppercase />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            href={ROUTES.LOGIN}
            data-testid="hero-signin-btn"
            style={{
              color: '#fff',
              fontSize: 13,
              fontWeight: 500,
              padding: '6px 16px',
              border: '1px solid rgba(255,255,255,0.5)',
              borderRadius: 3,
              textDecoration: 'none',
            }}
          >
            Sign in
          </Link>
          <Link
            href={ROUTES.REGISTER}
            data-testid="hero-create-account-btn"
            style={{
              background: '#ff5500',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              padding: '6px 16px',
              borderRadius: 3,
              textDecoration: 'none',
            }}
          >
            Create account
          </Link>
          <Link
            href="/for-artists"
            data-testid="hero-for-artists-btn"
            style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, cursor: 'pointer', textDecoration: 'none' }}
          >
            For Artists
          </Link>
        </div>
      </nav>

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '40px 48px 0',
        }}
      >
        <h1
          data-testid="hero-title"
          style={{
            fontSize: 56,
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: 16,
            whiteSpace: 'pre-line',
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          {slides[current].title}
        </h1>
        <p
          data-testid="hero-subtitle"
          style={{
            maxWidth: 480,
            fontSize: 15,
            marginBottom: 28,
            opacity: 0.9,
            lineHeight: 1.6,
          }}
        >
          {slides[current].subtitle}
        </p>
        <Link
          href={ROUTES.LOGIN}
          data-testid="hero-get-started-btn"
          style={{
            display: 'inline-block',
            background: '#fff',
            color: '#000',
            padding: '10px 24px',
            borderRadius: 3,
            fontWeight: 700,
            fontSize: 14,
            textDecoration: 'none',
            width: 'fit-content',
          }}
        >
          Get Started
        </Link>
      </div>

      <div
        data-testid="hero-slider-dots"
        style={{
          position: 'absolute',
          bottom: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 10,
          zIndex: 20,
        }}
      >
        {slides.map((_, index) => (
          <button
            key={index}
            data-testid={`hero-slider-dot-${index}`}
            onClick={() => setCurrent(index)}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              border: '2px solid #fff',
              background: current === index ? '#fff' : 'transparent',
              cursor: 'pointer',
              padding: 0,
              transition: 'background 200ms',
            }}
          />
        ))}
      </div>

      <div
        data-testid="hero-artist-credit"
        style={{
          position: 'absolute',
          bottom: 28,
          right: 28,
          textAlign: 'right',
          zIndex: 20,
          lineHeight: 1.4,
        }}
      >
        <p style={{ fontWeight: 700, fontSize: 13, textShadow: '0 1px 4px rgba(0,0,0,0.5)', margin: 0 }}>
          {slides[current].artist}
        </p>
        <p style={{ fontSize: 11, color: '#ccc', textDecoration: 'underline', textUnderlineOffset: 2, margin: 0 }}>
          {slides[current].badge}
        </p>
      </div>
    </section>
  );
}
