import React from 'react';
import Link from 'next/link';
import s from '../HelpCenter.module.scss';
import { SearchIcon } from '@/shared/ui/icons';

export default function ReportingAbusePage() {
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
          <h2 className={s.pageTitle}>Reporting abuse or harassment</h2>
          
          <div className={s.contentBody}>
            <p>
              We want BioBeats to be a safe and welcoming space for everyone. If you or someone else is experiencing abuse, harassment, or bullying on the platform, we encourage you to report it to us immediately. 
            </p>
            <p>
              Before reporting, if you are receiving unwanted messages, comments, or interactions from a specific user, we highly recommend that you <strong>Block</strong> them first. Blocking immediately stops them from interacting with your profile and completely hides their messages from your inbox.
            </p>
            
            <strong>To report abuse or harassment, please provide the following details:</strong>
            <ul>
              <li>The URL of the user engaging in the abusive behavior</li>
              <li>Links to any specific tracks, comments, or messages where the abuse occurred</li>
              <li>A description of that behavior and how it violates our community guidelines</li>
            </ul>

            <br />
            <strong>What happens next?</strong>
            <p>
              Our Trust & Safety team will review the reported account based on our Community Guidelines and Terms of Use. If we find that a user is violating our rules against harassment, we will take appropriate action, which may include warnings, content removal, or permanent account suspension.
            </p>
            <p>
              Please note that we cannot handle issues that happen outside of the BioBeats platform. If you feel you are in immediate physical danger, please contact your local law enforcement.
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
              <Link href="/help/reporting-impersonation">Reporting impersonation</Link>
              <Link href="/help/reporting-impersonation">Reporting tracks on the wrong profile</Link>
              <Link href="#">BioBeats Status</Link>
            </div>
            <div className={s.bottomArticlesColumn}>
              <h4>Recently viewed articles</h4>
              <Link href="/help/reporting-trademark-infringement">Reporting trademark infringement</Link>
              <Link href="/help/reporting-impersonation">Reporting on BioBeats</Link>
              <Link href="/help/reporting-impersonation">Reporting impersonation</Link>
            </div>
          </div>
        </div>

        <div className={s.sidebar}>
          <div className={s.sidebarTitle}>Articles in this section</div>
          <Link href="/help/reporting-impersonation">Reporting a spam account</Link>
          <Link href="/help/reporting-impersonation">Reporting tracks on the wrong profile</Link>
          <Link href="/help/reporting-impersonation">Reporting a deceased community member</Link>
          <Link href="/help/reporting-impersonation">Reporting a minor on the platform</Link>
          <Link href="/help/reporting-impersonation">Reporting impersonation</Link>
          <Link href="/help/reporting-abuse" style={{color: '#333'}}>Reporting abuse or harassment</Link>
        </div>
      </div>
    </>
  );
}
