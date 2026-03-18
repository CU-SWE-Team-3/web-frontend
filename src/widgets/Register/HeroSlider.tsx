'use client'

import React, { useState } from 'react';

const slides = [
  {
    title: "Discover.\nGet Discovered.",
    subtitle: "Discover your next obsession, or become someone else's. SoundCloud is the only community where fans and artists come together.",
    artist: "DC the Don", //need to use a placeholder for now until we have an API to pull this data from
    badge: "SoundCloud Artist Pro",
    bg: "/slide1.jpg" // Put your images in the public folder
  },

  {
    title: "It all starts with\nan upload.",
    subtitle: "From bedrooms and broom closets to studios and stadiums, SoundCloud is where you define what's next.",
    artist: "1900Rugrat",
    badge: "Ascending Artist",
    bg: "/slide2.jpg"
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  return (
    <section className="hero-banner relative mx-auto max-w-[1240px] h-[450px] overflow-hidden rounded-md text-white">
      {/* Background with Transition */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out brightness-75"
        style={{ backgroundImage: `url(${slides[current].bg})` }}
      ></div>

      {/* Content Area */}
      <div className="relative z-10 p-12 h-full flex flex-col justify-center">
        <h1 className="text-6xl font-extrabold leading-tight mb-4 whitespace-pre-line">
          {slides[current].title}
        </h1>
        <p className="max-w-md text-lg mb-8 opacity-90">
          {slides[current].subtitle}
        </p>
        <button className="bg-white text-black px-6 py-2 rounded-sm font-bold w-max">
          Get Started
        </button>
      </div>

      {/* Slider Dots (The 3 points) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full border-2 border-white transition-all ${
              current === index ? "bg-white" : "bg-transparent"
            }`}
          />
        ))}
      </div>

      {/* Artist Credit (Bottom Right) */}
      <div className="absolute bottom-10 right-10 text-right z-20 leading-tight">
        <p className="font-bold text-sm">{slides[current].artist}</p>
        <p className="text-xs text-gray-300 underline underline-offset-2">
          {slides[current].badge}
        </p>
      </div>
    </section>
  );
}