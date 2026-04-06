'use client';

import type { Track } from './playerStore';

/**
 * Two demo tracks with real audio for testing the player.
 * Uses royalty-free audio hosted publicly.
 */
export const DEMO_TRACKS: Track[] = [
  {
    id: 'demo-track-1',
    title: 'Summer Vibes',
    artist: 'BioBeats Demo',
    artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    duration: 30,
    hlsUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 'demo-track-2',
    title: 'Night Drive',
    artist: 'BioBeats Demo',
    artworkUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    duration: 30,
    hlsUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
];
