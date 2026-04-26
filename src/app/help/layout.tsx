import React from 'react';
import Link from 'next/link';
import s from './HelpCenter.module.scss';
import { ROUTES } from '@/shared/constants/routes';

export const metadata = {
  title: 'BioBeats Help Center',
  description: 'BioBeats Help Center',
};

export default function HelpCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={s.helpCenterWrapper}>
      {/* BioBeats Help Nav */}
      <div className={s.helpNav}>
        <Link href={ROUTES.HOME} className={s.helpLogo}>
          BIOBEATS
        </Link>
        <button className={s.statusBtn}>Status Page</button>
      </div>

      {/* Fan powered banner */}
      <div className={s.topBar}>
        We're the first music company to introduce fan-powered royalties, where independent artists can get paid more because of their dedicated fans. <a href="#">More info here.</a>
      </div>

      {children}

      {/* Orange Footer */}
      <div className={s.footer}>
        <div className={s.footerLinks}>
          <Link href={ROUTES.HOME}>BioBeats</Link>
          <a href="#">For Artists</a>
          <a href="#">Terms of Use</a>
          <a href="#">English (United States)</a>
        </div>
        <div className={s.footerIcons}>
          <span>f</span>
          <span>X</span>
          <span>in</span>
          <span>ig</span>
          <span>yt</span>
        </div>
      </div>
    </div>
  );
}
