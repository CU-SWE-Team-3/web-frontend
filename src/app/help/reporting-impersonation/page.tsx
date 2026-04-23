import React from 'react';
import Link from 'next/link';
import s from '../HelpCenter.module.scss';
import { SearchIcon } from '@/shared/ui/icons';

export default function ReportingImpersonationPage() {
  return (
    <>
      <div className={s.header}>
        <div className={s.breadcrumbs}>
          BioBeats Help Center / Legal, Safety & Reporting / Reporting Violations / Report Account & Profile Issues
        </div>
        <h1 className={s.title}>Report Account & Profile Issues</h1>
        <div className={s.searchContainer}>
          <div className={s.searchIcon}><SearchIcon size={18} /></div>
          <input type="text" className={s.searchInput} placeholder="Search for answers..." />
        </div>
      </div>

      <div className={s.layoutContainer}>
        <div className={s.mainContent}>
          <h2 className={s.pageTitle}>Reporting impersonation</h2>
          
          <div className={s.contentBody}>
            <p>
              If you have found an account that is using the same Display Name as you, please
              remember that it is unlikely that any name is unique. It may be that another user has
              the same name (or artist name) as you and has no intention of impersonating you.
            </p>
            <p>
              We consider impersonation to be when an account is set up with the sole intention
              of pretending to be a genuine representation of another individual or group. This
              means that it would need to be clear when looking at an account that the intention is
              to convince others that the reported profile is in fact individual X or group Y.
              Therefore, when investigating reports of impersonation, we take the entirety of an
              account into consideration e.g. Profile URL, Display Name, profile description,
              artwork etc.
            </p>
            <p>
              In our experience, using the same Display Name as another person does not always
              mean that the intention is to impersonate. That being said, if you come across an
              account that you feel is impersonating you, we can help. Before contacting us,
              please check if the account you are concerned about has been set up on your
              behalf.
            </p>

            <strong>If you would like to report impersonation, please provide us with the following details:</strong>
            <ul>
              <li>Your URL (if you have an account with us)</li>
              <li>The URL of the account you want to report</li>
              <li>A brief explanation of how the account is impersonating you</li>
            </ul>

            <br />
            <strong>If you are signed to a label or are using a distributor:</strong>
            <p>
              As part of the launch of BioBeats Go, official representatives of artists (label,
              distributor or rightsholder) are able to create accounts on artists' behalf. This means
              if the BioBeats account has no image of you, contains the word "official" or
              "music" in the URL and has uploaded your content/ tracks please get in touch with
              your label, distributor or rightsholder directly for removal or management of the
              account.
            </p>
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
              <Link href="/help/reporting-impersonation">Reporting on BioBeats</Link>
              <Link href="/help/reporting-impersonation">Reporting an account</Link>
              <Link href="/help/reporting-abuse">Reporting abuse or harassment</Link>
              <Link href="/help/reporting-impersonation">Reporting tracks on the wrong profile</Link>
              <Link href="#">BioBeats Status</Link>
            </div>
            <div className={s.bottomArticlesColumn}>
              <h4>Recently viewed articles</h4>
              <Link href="/help/reporting-trademark-infringement">Reporting trademark infringement</Link>
              <Link href="/help/reporting-impersonation">Reporting on BioBeats</Link>
              <Link href="/help/reporting-abuse">Reporting abuse or harassment</Link>
            </div>
          </div>
        </div>

        <div className={s.sidebar}>
          <div className={s.sidebarTitle}>Articles in this section</div>
          <Link href="/help/reporting-impersonation">Reporting a spam account</Link>
          <Link href="/help/reporting-impersonation">Reporting tracks on the wrong profile</Link>
          <Link href="/help/reporting-impersonation">Reporting a deceased community member</Link>
          <Link href="/help/reporting-impersonation">Reporting a minor on the platform</Link>
          <Link href="/help/reporting-impersonation" style={{color: '#333'}}>Reporting impersonation</Link>
        </div>
      </div>
    </>
  );
}
