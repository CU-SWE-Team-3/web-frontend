'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/shared/constants/routes';
import { BioBeatsLogo } from '@/shared/ui/Brand';
import s from './HeroSlider.module.scss';

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
      className={s.hero}
    >
      {slides.map((slide, i) => (
        <img
          key={slide.bg}
          src={slide.bg}
          alt=""
          data-testid={`hero-slide-image-${i}`}
          className={s.slideImage}
          style={{
            opacity: current === i ? 1 : 0,
          }}
        />
      ))}

      <div className={s.overlay} />

      <nav
        data-testid="hero-nav"
        className={s.nav}
      >
        <BioBeatsLogo iconSize={28} textSize={18} uppercase />
        <div className={s.actions}>
          <Link
            href={ROUTES.LOGIN}
            data-testid="hero-signin-btn"
            className={s.linkButton}
          >
            Sign in
          </Link>
          <Link
            href={ROUTES.REGISTER}
            data-testid="hero-create-account-btn"
            className={s.primaryButton}
          >
            Create account
          </Link>
          <Link
            href={ROUTES.ARTIST_PRO}
            data-testid="hero-for-artists-btn"
            className={s.textLink}
          >
            For Artists
          </Link>
        </div>
      </nav>

      <div className={s.content}>
        <h1
          data-testid="hero-title"
          className={s.title}
        >
          {slides[current].title}
        </h1>
        <p
          data-testid="hero-subtitle"
          className={s.subtitle}
        >
          {slides[current].subtitle}
        </p>
        <Link
          href={ROUTES.LOGIN}
          data-testid="hero-get-started-btn"
          className={s.ctaButton}
        >
          Get Started
        </Link>
      </div>

      <div
        data-testid="hero-slider-dots"
        className={s.dots}
      >
        {slides.map((_, index) => (
          <button
            key={index}
            data-testid={`hero-slider-dot-${index}`}
            onClick={() => setCurrent(index)}
            className={s.dot}
            style={{
              background: current === index ? '#fff' : 'transparent',
            }}
          />
        ))}
      </div>

      <div
        data-testid="hero-artist-credit"
        className={s.credit}
      >
        <p className={s.artist}>
          {slides[current].artist}
        </p>
        <p className={s.badge}>
          {slides[current].badge}
        </p>
      </div>
    </section>
  );
}
