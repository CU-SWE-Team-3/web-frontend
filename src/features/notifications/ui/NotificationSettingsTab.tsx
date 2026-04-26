'use client'

import { type FC } from 'react'
import { useNotificationPreferencesStore } from '../model/useNotificationPreferencesStore'
import s from './NotificationSettingsTab.module.scss'

// ─── Activity rows config ──────────────────────────────────────────────────────
const ACTIVITY_ROWS: ReadonlyArray<{
  key: string
  label: string
  channels: ReadonlyArray<'email' | 'devices' | 'devicesSelect'>
  hasInfo?: boolean
}> = [
  { key: 'newFollower', label: 'New follower', channels: ['email', 'devices'] },
  { key: 'repostOfYourPost', label: 'Repost of your post', channels: ['email', 'devices'] },
  { key: 'newPostByFollowedUser', label: 'New post by followed user', channels: ['email', 'devices'] },
  { key: 'likesAndPlaysOnYourPost', label: 'Likes and plays on your post', channels: ['email', 'devices'] },
  { key: 'commentOnYourPost', label: 'Comment on your post', channels: ['email', 'devices'] },
  { key: 'recommendedContent', label: 'Recommended Content', channels: ['email', 'devices'] },
  { key: 'newMessage', label: 'New message', channels: ['email', 'devicesSelect'], hasInfo: true },
]

// ─── Updates rows config ───────────────────────────────────────────────────────
const UPDATE_ROWS: ReadonlyArray<{
  key: string
  label: string
  channels: ReadonlyArray<'email' | 'devices'>
}> = [
  { key: 'featureUpdatesAndEducation', label: 'BioBeats Feature Updates & Education', channels: ['email', 'devices'] },
  { key: 'surveysAndFeedback', label: 'Surveys and feedback', channels: ['email', 'devices'] },
  { key: 'promotionalAndPartnershipContent', label: 'Promotional & Partnership Content', channels: ['email', 'devices'] },
  { key: 'soundCloudNewsletter', label: 'BioBeats newsletter', channels: ['email'] },
]

export const NotificationSettingsTab: FC = () => {
  const {
    activities,
    updates,
    isLoading,
    isDirty,
    toggleActivity,
    toggleUpdate,
    savePreferences,
    resetChanges,
  } = useNotificationPreferencesStore()

  return (
    <div className={s.tab} data-testid="notification-settings-tab">
      {/* ───────── Activities ───────── */}
      <div data-testid="notification-settings-activities">
        <h2 className={s.sectionTitle}>Activities</h2>

        {/* Column headers */}
        <div className={s.columnHeaders}>
          <div className={s.columnHeaderSpacer} />
          <div className={s.columnHeaderCheckbox}>
            <input
              type="checkbox"
              checked={true}
              readOnly
              data-testid="notification-activities-email-header"
            />
            <span>Email</span>
          </div>
          <div className={s.columnHeaderCheckbox}>
            <input
              type="checkbox"
              checked={true}
              readOnly
              data-testid="notification-activities-devices-header"
            />
            <span>Devices</span>
          </div>
        </div>

        {/* Activity rows */}
        {ACTIVITY_ROWS.map((row) => {
          const activityValue = (activities as any)[row.key]
          return (
            <div className={s.prefRow} key={row.key}>
              <div className={s.prefLabel}>
                {row.label}
                {row.hasInfo && <span className={s.prefLabelInfo}>i</span>}
              </div>

              {/* Email checkbox */}
              <div className={s.prefCheckbox}>
                <input
                  type="checkbox"
                  checked={activityValue?.email ?? false}
                  onChange={(e) => toggleActivity(row.key, 'email', e.target.checked)}
                  data-testid={`notification-pref-${row.key}-email`}
                />
              </div>

              {/* Devices checkbox or select */}
              {row.channels.includes('devicesSelect' as any) ? (
                <div className={s.prefSelect}>
                  <select
                    value={activityValue?.devices ?? 'Everyone'}
                    onChange={(e) => toggleActivity(row.key, 'devices', e.target.value)}
                    data-testid={`notification-pref-${row.key}-devices`}
                  >
                    <option value="Everyone">Everyone</option>
                    <option value="Following">Following</option>
                    <option value="Nobody">Nobody</option>
                  </select>
                </div>
              ) : (
                <div className={s.prefCheckbox}>
                  <input
                    type="checkbox"
                    checked={activityValue?.devices ?? false}
                    onChange={(e) => toggleActivity(row.key, 'devices', e.target.checked)}
                    data-testid={`notification-pref-${row.key}-devices`}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ───────── Divider ───────── */}
      <div className={s.divider} />

      {/* ───────── Updates from SoundCloud ───────── */}
      <div data-testid="notification-settings-updates">
        <h2 className={s.sectionTitle}>Updates from BioBeats</h2>

        {/* Column headers */}
        <div className={s.columnHeaders}>
          <div className={s.columnHeaderSpacer} />
          <div className={s.columnHeaderCheckbox}>
            <input
              type="checkbox"
              checked={true}
              readOnly
              data-testid="notification-updates-email-header"
            />
            <span>Email</span>
          </div>
          <div className={s.columnHeaderCheckbox}>
            <input
              type="checkbox"
              checked={true}
              readOnly
              data-testid="notification-updates-devices-header"
            />
            <span>Devices</span>
          </div>
        </div>

        {/* Update rows */}
        {UPDATE_ROWS.map((row) => {
          const updateValue = (updates as any)[row.key]
          return (
            <div className={s.prefRow} key={row.key}>
              <div className={s.prefLabel}>{row.label}</div>

              {/* Email */}
              <div className={s.prefCheckbox}>
                <input
                  type="checkbox"
                  checked={updateValue?.email ?? false}
                  onChange={(e) => toggleUpdate(row.key, 'email', e.target.checked)}
                  data-testid={`notification-pref-${row.key}-email`}
                />
              </div>

              {/* Devices (not all rows have it) */}
              {row.channels.includes('devices') ? (
                <div className={s.prefCheckbox}>
                  <input
                    type="checkbox"
                    checked={updateValue?.devices ?? false}
                    onChange={(e) => toggleActivity(row.key, 'devices', e.target.checked)}
                    data-testid={`notification-pref-${row.key}-devices`}
                  />
                </div>
              ) : (
                <div className={s.prefCheckbox} />
              )}
            </div>
          )
        })}
      </div>

      {/* ───────── Actions ───────── */}
      <div className={s.actions}>
        <button
          className={s.cancelBtn}
          onClick={resetChanges}
          data-testid="notification-settings-cancel-btn"
        >
          Cancel
        </button>
        <button
          className={s.saveBtn}
          onClick={savePreferences}
          disabled={!isDirty || isLoading}
          data-testid="notification-settings-save-btn"
        >
          {isLoading ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
