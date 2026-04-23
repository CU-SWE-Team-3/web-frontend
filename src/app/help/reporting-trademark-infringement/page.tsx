import React from 'react';
import Link from 'next/link';
import s from '../HelpCenter.module.scss';
import { SearchIcon } from '@/shared/ui/icons';

export default function ReportingTrademarkPage() {
  return (
    <>
      <div className={s.header}>
        <div className={s.breadcrumbs}>
          BioBeats Help Center / Legal, Safety & Reporting / Reporting Violations / Report Content Ownership & IP Issues
        </div>
        <h1 className={s.title}>Report Content Ownership & IP Issues</h1>
        <div className={s.searchContainer}>
          <div className={s.searchIcon}><SearchIcon size={18} /></div>
          <input type="text" className={s.searchInput} placeholder="Search for answers..." />
        </div>
      </div>

      <div className={s.layoutContainer}>
        <div className={s.mainContent}>
          <h2 className={s.pageTitle}>Reporting trademark infringement</h2>
          
          <div className={s.contentBody}>
            <p>
              As a platform built with the needs of creators in mind, we take protecting trademark
              rights seriously.
            </p>
            <p>
              If you would like content to be removed from BioBeats that infringes your
              trademark rights, please contact our Trust & Safety team using our chatbot feature
              and provide us with the following details:
            </p>
            
            <ol>
              <li>The full URL where the allegedly infringing material is located</li>
              <li>Your full name, address, email, and telephone number</li>
              <li>Your trademark registration number, and the countries in which your trademark is registered</li>
              <li>A brief explanation of how the reported content infringes your trademark</li>
              <li>The statement: "I have a good faith belief that use of the trademarks described above on BioBeats is not authorized by the trademark owner or its agent, nor is such use otherwise permissible under law."</li>
              <li>The statement: "I represent that the information in this notification is true and correct and that I am authorized to act on behalf of the trademark owner."</li>
              <li>Scanned copy of your physical signature</li>
            </ol>

            <p>
              <strong>Please note:</strong> by submitting a takedown notification, you consent to having your
              information revealed to parties involved in the case.
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
              <Link href="/help/reporting-impersonation">Reporting impersonation</Link>
              <Link href="/help/reporting-abuse">Reporting abuse or harassment</Link>
              <Link href="#">My track was removed from BioBeats for copyright infringement</Link>
              <Link href="/help/reporting-impersonation">Reporting tracks on the wrong profile</Link>
            </div>
            <div className={s.bottomArticlesColumn}>
              <h4>Recently viewed articles</h4>
              <Link href="/help/reporting-abuse">Reporting abuse or harassment</Link>
              <Link href="/help/reporting-impersonation">Reporting impersonation</Link>
              <Link href="/help/reporting-impersonation">Reporting on BioBeats</Link>
              <Link href="#">Your spoken word podcast was taken down for copyright infringement</Link>
            </div>
          </div>
        </div>

        <div className={s.sidebar}>
          <div className={s.sidebarTitle}>Articles in this section</div>
          <Link href="#">Reporting conflict of ownership</Link>
          <Link href="/help/reporting-trademark-infringement" style={{color: '#333'}}>Reporting trademark infringement</Link>
        </div>
      </div>
    </>
  );
}
