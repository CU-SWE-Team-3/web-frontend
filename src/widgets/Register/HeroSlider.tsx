'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/shared/constants/routes';

const slides = [
  {
    title: "Discover.\nGet Discovered.",
    subtitle: "Discover your next obsession, or become someone else's. SoundCloud is the only community where fans and artists come together to discover and connect through music.",
    artist: "DC the Don",
    badge: "SoundCloud Artist Pro",
    bg: "/slide1.png"
  },
  {
    title: "It all starts with\nan upload.",
    subtitle: "From bedrooms and broom closets to studios and stadiums, SoundCloud is where you define what's next.",
    artist: "1900Rugrat",
    badge: "Ascending Artist",
    bg: "/slide2.png"
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
      {/* Background Images */}
      {slides.map((slide, i) => (
        <img
          key={i}
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

      {/* Dark gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(0,0,0,0.65), rgba(0,0,0,0.25), transparent)',
          zIndex: 1,
        }}
      />

      {/* Nav inside hero */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="white">
            <path d="M1.28 21.76a3.2 3.2 0 106.4 0v-6.4a3.2 3.2 0 00-6.4 0v6.4zM8.96 21.76a3.2 3.2 0 106.4 0v-9.6a3.2 3.2 0 00-6.4 0v9.6zM16.64 21.76a3.2 3.2 0 106.4 0V8.96a3.2 3.2 0 00-6.4 0v12.8zM24.32 21.76a3.2 3.2 0 106.4 0V6.4a3.2 3.2 0 00-6.4 0v15.36z"/>
          </svg>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>SOUNDCLOUD</span>
        </div>
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

      {/* Content */}
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

      {/* Slider Dots */}
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

      {/* Artist Credit */}
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