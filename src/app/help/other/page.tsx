import React from 'react';
import Link from 'next/link';
import s from '../HelpCenter.module.scss';
import { SearchIcon } from '@/shared/ui/icons';

export default function ReportingOtherPage() {
  return (
    <>
      <div className={s.header}>
        <div className={s.breadcrumbs}>
          BioBeats Help Center / Legal, Safety & Reporting / Reporting Violations / Reporting Violations on BioBeats
        </div>
        <h1 className={s.title}>Reporting Violations on BioBeats</h1>
        <div className={s.searchContainer}>
          <div className={s.searchIcon}><SearchIcon size={18} /></div>
          <input type="text" className={s.searchInput} placeholder="Search for answers..." />
        </div>
      </div>

      <div className={s.layoutContainer}>
        <div className={s.mainContent}>
          <h2 className={s.pageTitle}>Reporting on BioBeats</h2>
          
          <div className={s.contentBody}>
            <p>
              We take our <strong>Terms of Use</strong> and <strong>Community Guidelines</strong> seriously, and expect
              everyone in the community to do the same. We hope that you will never need to
              report violations. But, in case you do come across something you think we need to
              take a look at, read on to find out more about reporting and our approach to
              moderation.
            </p>
            <p>
              We have a dedicated team of people who spend their time reviewing all reports
              objectively, using our Terms of Use, Community Guidelines, and internal policies
              when moderating reports. Remember that we can only make decisions based on the
              information we have available to us. This means that we cannot accept reports of
              activity that happens externally from BioBeats.
            </p>
            <p>
              Please bear in mind that something that you find unacceptable may not be
              unacceptable to everyone. We try to maintain a fair and balanced approach and will
              remove any content that violates these rules or applicable law. Reporting content
              will not always result in that content being removed if it does not break the rules.
              Either way, we will always let you know the outcome of your report as soon as we
              can.
            </p>

            <h3 style={{ fontSize: '18px', fontWeight: 600, marginTop: '32px', marginBottom: '16px' }}>What would you like to report?</h3>
            <div className={s.contentLinks}>
              <Link href="#" className={s.contentLink}>Spam account</Link>
              <Link href="#" className={s.contentLink}>Fake activity, stream rippers, or scams</Link>
              <Link href="#" className={s.contentLink}>Inappropriate Content</Link>
              <Link href="#" className={s.contentLink}>Promotional services and advertising</Link>
              <Link href="/help/reporting-trademark-infringement" className={s.contentLink}>Trademark infringement</Link>
              <Link href="#" className={s.contentLink}>Copyright infringement</Link>
              <Link href="#" className={s.contentLink}>API violations</Link>
              <Link href="#" className={s.contentLink}>Security vulnerability</Link>
              <Link href="#" className={s.contentLink}>Tracks on the wrong profile</Link>
            </div>
          </div>

          <div className={s.helpfulBox}>
            <h4>Was this article helpful?</h4>
            <div className={s.helpfulButtons}>
              <button className={s.helpfulBtn}>Yes</button>
              <button className={s.helpfulBtn}>No</button>
            </div>
            <div className={s.helpfulSub}>
              Have more questions? <a href="#">Submit a request</a>
            </div>
          </div>

          <div className={s.bottomArticles}>
            <div className={s.bottomArticlesColumn}>
              <h4>Related articles</h4>
              <Link href="/help/reporting-impersonation">Reporting an account</Link>
              <Link href="/help/reporting-abuse">Reporting abuse or harassment</Link>
              <Link href="/help/reporting-impersonation">Reporting impersonation</Link>
              <Link href="/help/other">Reporting content</Link>
              <Link href="/help/reporting-impersonation">Reporting tracks on the wrong profile</Link>
            </div>
            <div className={s.bottomArticlesColumn}>
              <h4>Recently viewed articles</h4>
              <Link href="/help/reporting-abuse">Reporting abuse or harassment</Link>
              <Link href="/help/reporting-trademark-infringement">Reporting trademark infringement</Link>
              <Link href="/help/reporting-impersonation">Reporting impersonation</Link>
              <Link href="#">Your spoken word podcast was taken down for copyright infringement</Link>
            </div>
          </div>
        </div>

        <div className={s.sidebar}>
          <div className={s.sidebarTitle}>Articles in this section</div>
          <Link href="/help/other" style={{color: '#333'}}>Reporting on BioBeats</Link>
          <Link href="/help/reporting-impersonation">Reporting an account</Link>
          <Link href="/help/other">Reporting activity</Link>
          <Link href="/help/other">Reporting content</Link>
        </div>
      </div>
    </>
  );
}
