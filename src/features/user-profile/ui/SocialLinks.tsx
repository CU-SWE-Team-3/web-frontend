'use client';

import { type FC } from 'react';
import { Instagram, Twitter, Globe } from 'lucide-react';
import s from './SocialLinks.module.scss';

interface SocialLink {
  platform: 'instagram' | 'twitter' | 'website';
  url: string;
}

export interface SocialLinksProps {
  instagram?: string;
  twitter?: string;
  website?: string;
  className?: string;
}

const ICON_MAP = {
  instagram: Instagram,
  twitter: Twitter,
  website: Globe,
} as const;

const LABEL_MAP = {
  instagram: 'Instagram',
  twitter: 'Twitter',
  website: 'Website',
} as const;

export const SocialLinks: FC<SocialLinksProps> = ({
  instagram,
  twitter,
  website,
  className,
}) => {
  const links: SocialLink[] = [
    instagram && { platform: 'instagram' as const, url: instagram },
    twitter && { platform: 'twitter' as const, url: twitter },
    website && { platform: 'website' as const, url: website },
  ].filter((v): v is SocialLink => Boolean(v));

  if (links.length === 0) return null;

  return (
    <div className={[s.container, className].filter(Boolean).join(' ')}>
      {links.map(({ platform, url }) => {
        const Icon = ICON_MAP[platform];
        return (
          <a
            key={platform}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={s.link}
            aria-label={LABEL_MAP[platform]}
          >
            <Icon size={16} />
            <span>{LABEL_MAP[platform]}</span>
          </a>
        );
      })}
    </div>
  );
};
