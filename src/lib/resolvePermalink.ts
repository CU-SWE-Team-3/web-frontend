import { ROUTES } from '@/shared/constants/routes';

export type ResolutionResult =
  | { type: 'track'; slug: string; href: string }
  | { type: 'user'; slug: string; href: string }
  | { type: 'unknown'; slug: null; href: string };

// Known reserved path prefixes — these are never treated as usernames
const RESERVED_PREFIXES = new Set([
  'tracks', 'profile', 'search', 'trending', 'feed', 'upload',
  'library', 'settings', 'login', 'register', 'home', 'for-artists', 'artists',
  'my-tracks', 'history', 'likes', 'stations', 'google', 'verify-email',
]);

/**
 * Parses a permalink or full URL and resolves it to an internal application route.
 *
 * Supported patterns:
 *  1. /profile/:username              → user page
 *  2. /tracks/:permalink              → track page (internal format)
 *  3. /:username/:track-slug          → track page (canonical SoundCloud URL format)
 *  4. https://soundcloud.com/...      → strips domain, then applies rules 1-3
 *
 * Examples:
 *  resolvePermalink('https://soundcloud.com/drake/gods-plan')
 *    → { type: 'track', slug: 'gods-plan', href: '/tracks/gods-plan' }
 *  resolvePermalink('/profile/john-doe')
 *    → { type: 'user', slug: 'john-doe', href: '/profile/john-doe' }
 *  resolvePermalink('/tracks/my-song')
 *    → { type: 'track', slug: 'my-song', href: '/tracks/my-song' }
 */
export function resolvePermalink(urlOrPath: string): ResolutionResult {
  if (!urlOrPath) {
    return { type: 'unknown', slug: null, href: ROUTES.HOME };
  }

  let pathname = urlOrPath;

  // If it's a full URL, extract just the pathname
  try {
    if (urlOrPath.startsWith('http')) {
      const url = new URL(urlOrPath);
      pathname = url.pathname;
    }
  } catch {
    // Invalid URL format — treat as a raw path string
    pathname = urlOrPath;
  }

  // Normalise: strip leading slash, split into clean segments
  const cleanPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
  const segments = cleanPath.split('/').filter(Boolean);

  if (segments.length === 0) {
    return { type: 'unknown', slug: null, href: ROUTES.HOME };
  }

  // Pattern 1: /profile/:username
  if (segments[0] === 'profile' && segments[1]) {
    return {
      type: 'user',
      slug: segments[1],
      href: ROUTES.PROFILE(segments[1]),
    };
  }

  // Pattern 2: /tracks/:permalink (internal app format)
  if (segments[0] === 'tracks' && segments[1]) {
    return {
      type: 'track',
      slug: segments[1],
      href: ROUTES.TRACK(segments[1]),
    };
  }

  // Pattern 3: /:username/:track-slug (canonical SoundCloud share URL)
  // Condition: exactly 2 segments and the first is not a reserved route prefix
  if (segments.length === 2 && !RESERVED_PREFIXES.has(segments[0])) {
    const trackSlug = segments[1];
    return {
      type: 'track',
      slug: trackSlug,
      href: ROUTES.TRACK(trackSlug),
    };
  }

  // Pattern 4: /:username only (single non-reserved segment → user profile)
  if (segments.length === 1 && !RESERVED_PREFIXES.has(segments[0])) {
    return {
      type: 'user',
      slug: segments[0],
      href: ROUTES.PROFILE(segments[0]),
    };
  }

  // Fallback
  return { type: 'unknown', slug: null, href: ROUTES.HOME };
}
