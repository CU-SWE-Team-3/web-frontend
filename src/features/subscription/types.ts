// component-id: SubscriptionTypes_001

export type SubscriptionPlan = 'Free' | 'Artist' | 'Pro' | 'Go+';

export type BillingCycle = 'monthly' | 'yearly';

export interface CheckoutResponse {
  success: boolean;
  checkoutUrl: string;
}

export interface CancelResponse {
  success: boolean;
  data: {
    message: string;
    expiresAt: string | null;
  };
}

// ── Pricing Constants (EGP) ────────────────────────────────────────────────

export const PLAN_PRICING = {
  Artist: {
    monthly: 29.99,
    yearly: 29.99,
    yearlyTotal: 359.88,
    label: 'Artist',
  },
  Pro: {
    monthly: 74.99,
    yearly: 74.99,
    yearlyTotal: 899.88,
    label: 'Artist Pro',
  },
  'Go+': {
    monthly: 9.99,
    yearly: 0.99,
    yearlyTotal: 0.99,
    label: 'Go+',
  },
} as const;

// ── Feature Comparison Data ────────────────────────────────────────────────

export interface FeatureRow {
  name: string;
  description: string;
  basic: string | null;
  artist: string;
  pro: string;
  proHighlight?: boolean;
}

export interface FeatureSection {
  title: string;
  rows: FeatureRow[];
}

export const FEATURE_SECTIONS: FeatureSection[] = [
  {
    title: 'Get heard',
    rows: [
      {
        name: 'Promote tracks',
        description: 'Our algorithm analyzes and recommends your tracks to 100 or even 1000 listeners most likely to love it.',
        basic: null,
        artist: '2 tracks / month',
        pro: 'Unlimited',
        proHighlight: true,
      },
      {
        name: 'Get playlisted',
        description: 'Subscribers that opt in can get featured on playlists like Buzzing followed by future fans, A&Rs, and more.',
        basic: null,
        artist: '2 tracks / month',
        pro: 'Unlimited',
        proHighlight: true,
      },
      {
        name: 'Distribute and get paid',
        description: 'Earn royalties from 60+ social and streaming platforms like Spotify and TikTok.',
        basic: null,
        artist: '2 tracks / month',
        pro: 'Unlimited',
        proHighlight: true,
      },
      {
        name: 'Advanced audience stats',
        description: 'See how listeners found your music, your top fans, and where they\'re located.',
        basic: null,
        artist: 'How fans found you',
        pro: 'Unlimited',
        proHighlight: true,
      },
      {
        name: 'Comments hub',
        description: 'Effectively track and answer messages and comments.',
        basic: null,
        artist: null,
        pro: 'Available',
        proHighlight: true,
      },
    ],
  },
  {
    title: 'Manage your music',
    rows: [
      {
        name: 'Upload limit',
        description: '',
        basic: '2 hours',
        artist: '3 hours',
        pro: 'Unlimited',
        proHighlight: true,
      },
      {
        name: 'Free mastering credits',
        description: '',
        basic: null,
        artist: '1 track / month',
        pro: '3 tracks / month',
        proHighlight: true,
      },
      {
        name: 'Replace tracks',
        description: 'Swap out your track files without losing plays, likes or comments.',
        basic: null,
        artist: '3 tracks / month',
        pro: 'Unlimited',
        proHighlight: true,
      },
      {
        name: 'Quiet mode',
        description: 'Hide or turn off comments for tracks, and choose if you want to have plays and likes displayed.',
        basic: null,
        artist: null,
        pro: 'Available',
        proHighlight: true,
      },
      {
        name: 'Schedule track releases',
        description: '',
        basic: null,
        artist: null,
        pro: 'Available',
        proHighlight: true,
      },
    ],
  },
  {
    title: 'Build your brand',
    rows: [
      {
        name: 'Profile badge',
        description: 'Visible to fans and collaborators.',
        basic: null,
        artist: 'ARTIST',
        pro: 'ARTIST PRO',
        proHighlight: true,
      },
      {
        name: 'Spotlight',
        description: 'Have control over your first impression by spotlighting your best tracks at the top of your profile.',
        basic: null,
        artist: '1 Track',
        pro: '5 Tracks',
        proHighlight: true,
      },
    ],
  },
  {
    title: 'Get paid',
    rows: [
      {
        name: 'Monetize on SoundCloud',
        description: 'Get paid for streams on SoundCloud with fan-powered royalties, and keep 100% of your earnings.',
        basic: null,
        artist: '2 tracks / month',
        pro: 'Unlimited',
        proHighlight: true,
      },
      {
        name: 'Distribute and monetize on 60+ other platforms',
        description: 'Earn royalties from 60+ social and streaming platforms, and keep 100% of your earnings.',
        basic: null,
        artist: '2 tracks / month',
        pro: 'Unlimited',
        proHighlight: true,
      },
      {
        name: 'YouTube Content ID',
        description: 'Get paid when your music is used in YouTube videos.',
        basic: null,
        artist: 'Available',
        pro: 'Available',
      },
      {
        name: 'Split royalties',
        description: 'Make sure that collaborators get paid.',
        basic: null,
        artist: null,
        pro: 'Available',
        proHighlight: true,
      },
    ],
  },
  {
    title: 'Special treatment',
    rows: [
      {
        name: 'Priority support',
        description: '',
        basic: null,
        artist: null,
        pro: 'Available',
        proHighlight: true,
      },
      {
        name: 'Get 50% off Go+',
        description: '',
        basic: null,
        artist: null,
        pro: 'Available',
        proHighlight: true,
      },
      {
        name: 'Exclusive Partner Savings',
        description: 'Enjoy exclusive discounts for purchases like Courses, Drums, and Plugins.',
        basic: null,
        artist: 'Partial access',
        pro: 'Full access',
        proHighlight: true,
      },
    ],
  },
];
