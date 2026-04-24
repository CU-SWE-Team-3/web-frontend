'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AdminTable } from '../components/AdminTable'
import { ConfirmModal } from '../components/ConfirmModal'
import { showAdminToast } from '../components/AdminToast'
import { searchTracks } from '../../api/adminApi'
import { useHideTrack, useRestoreTrack, useSuspendUser, useRestoreUser } from '../../hooks/useAdminModeration'

type ContentTab = 'tracks' | 'accounts'

// ─────────────────────────────────────────────────────────────────────────────
// NOTE FOR BACKEND TEAM:
// There is no dedicated admin user-list endpoint in the YAML spec.
// The Accounts tab currently shows users derived from the reports data.
// To fully support this panel, please expose:
//   GET /admin/users?search=&page=&limit= → paginated user list with accountStatus field
// ─────────────────────────────────────────────────────────────────────────────

const TRACK_COLS = [
  { key: 'artwork', label: 'Artwork', width: '80px' },
  { key: 'title', label: 'Title' },
  { key: 'artist', label: 'Artist' },
  { key: 'plays', label: 'Plays' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions', width: '180px' },
]

const ACCOUNT_COLS = [
  { key: 'name', label: 'Display Name' },
  { key: 'permalink', label: 'Handle' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions', width: '140px' },
]

export default function ContentPanel() {
  const [activeTab, setActiveTab] = useState<ContentTab>('tracks')
  const [trackSearch, setTrackSearch] = useState('')
  const [debouncedTrackSearch, setDebouncedTrackSearch] = useState('')
  const [selectedTrackIds, setSelectedTrackIds] = useState<Set<string>>(new Set())
  const [confirmModal, setConfirmModal] = useState<{
    type: 'hide' | 'restore-track' | 'suspend' | 'restore-user' | 'bulk-hide'
    id?: string
    ids?: string[]
  } | null>(null)

  const hideTrack = useHideTrack()
  const restoreTrack = useRestoreTrack()
  const suspendUser = useSuspendUser()
  const restoreUser = useRestoreUser()

  // Debounce track search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedTrackSearch(trackSearch), 400)
    return () => clearTimeout(t)
  }, [trackSearch])

  const { data: tracks = [], isLoading: tracksLoading } = useQuery({
    queryKey: ['admin-tracks', debouncedTrackSearch],
    queryFn: () => searchTracks(debouncedTrackSearch || undefined),
    staleTime: 30_000,
  })

  // ── Actions ───────────────────────────────────────────────────────────────

  const doConfirm = async () => {
    if (!confirmModal) return
    try {
      if (confirmModal.type === 'hide' && confirmModal.id) {
        await hideTrack.mutateAsync(confirmModal.id)
        setSelectedTrackIds((prev) => { const s = new Set(prev); s.delete(confirmModal.id!); return s })
        showAdminToast('Track hidden successfully', 'success')
      } else if (confirmModal.type === 'restore-track' && confirmModal.id) {
        await restoreTrack.mutateAsync(confirmModal.id)
        showAdminToast('Track restored', 'success')
      } else if (confirmModal.type === 'suspend' && confirmModal.id) {
        await suspendUser.mutateAsync(confirmModal.id)
        showAdminToast('User suspended', 'warning')
      } else if (confirmModal.type === 'restore-user' && confirmModal.id) {
        await restoreUser.mutateAsync(confirmModal.id)
        showAdminToast('User account restored', 'success')
      } else if (confirmModal.type === 'bulk-hide' && confirmModal.ids) {
        await Promise.all(confirmModal.ids.map((id) => hideTrack.mutateAsync(id)))
        setSelectedTrackIds(new Set())
        showAdminToast(`${confirmModal.ids.length} tracks hidden`, 'success')
      }
    } catch {
      showAdminToast('Operation failed — please try again', 'error')
    } finally {
      setConfirmModal(null)
    }
  }

  const confirmMessages: Record<string, string> = {
    hide: 'This will hide the track from the public feed (Hidden_By_Admin). The artist will still have access.',
    'restore-track': 'This will restore the track to public visibility.',
    suspend: 'This will immediately suspend the user account. They will be unable to log in.',
    'restore-user': 'This will restore the user account to Active status.',
    'bulk-hide': `This will hide ${selectedTrackIds.size} selected tracks from the public feed.`,
  }

  const isPending = hideTrack.isPending || restoreTrack.isPending || suspendUser.isPending || restoreUser.isPending

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 0, marginBottom: '1.5rem',
        background: '#1a1a1a', borderRadius: 8, padding: 4, width: 'fit-content',
        border: '1px solid #2a2a2a' }}>
        {(['tracks', 'accounts'] as ContentTab[]).map((tab) => (
          <button
            key={tab}
            id={`admin-tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.5rem 1.25rem', borderRadius: 6, border: 'none',
              background: activeTab === tab ? '#ff5500' : 'transparent',
              color: activeTab === tab ? '#fff' : '#666',
              fontWeight: activeTab === tab ? 700 : 400,
              fontSize: '0.875rem', cursor: 'pointer',
              transition: 'all 150ms', textTransform: 'capitalize',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── TRACKS TAB ──────────────────────────────────────────────── */}
      {activeTab === 'tracks' && (
        <>
          <div style={{
            display: 'flex', gap: '0.75rem', marginBottom: '1.5rem',
            alignItems: 'center', flexWrap: 'wrap',
          }}>
            <SearchInput
              id="admin-track-search"
              value={trackSearch}
              onChange={setTrackSearch}
              placeholder="Search tracks..."
            />
            <FilterSelect label="Genre: All" />
            <FilterSelect label="Upload Date: All Time" />
            <FilterSelect label="Status: All Statuses" />
            <button style={{
              marginLeft: 'auto', background: '#ff5500', color: '#fff',
              border: 'none', borderRadius: 6, padding: '0.65rem 1.25rem',
              fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(255,85,0,0.3)',
            }}>
              Apply Filters
            </button>
          </div>

          <AdminTable
            columns={TRACK_COLS}
            data={tracks}
            isLoading={tracksLoading}
            getId={(t) => t._id}
            selectedIds={selectedTrackIds}
            emptyMessage="No tracks found."
            onSelectAll={(checked) => {
              setSelectedTrackIds(checked ? new Set(tracks.map((t) => t._id)) : new Set())
            }}
            renderRow={(track) => {
              const isHidden = track.moderationStatus === 'Hidden_By_Admin'
              const isSelected = selectedTrackIds.has(track._id)
              return (
                <tr
                  key={track._id}
                  style={{ borderBottom: '1px solid #1e1e1e', transition: 'background 150ms' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#1f1f1f')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ ...td, width: 40 }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        setSelectedTrackIds((prev) => {
                          const s = new Set(prev)
                          e.target.checked ? s.add(track._id) : s.delete(track._id)
                          return s
                        })
                      }}
                      style={{ accentColor: '#ff5500' }}
                    />
                  </td>
                  <td style={td}>
                    {track.artworkUrl ? (
                      <img src={track.artworkUrl} alt="" width={40} height={40}
                        style={{ borderRadius: 6, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: 6, background: '#333' }} />
                    )}
                  </td>
                  <td style={{ ...td, color: '#eee', fontWeight: 500 }}>{track.title}</td>
                  <td style={{ ...td, color: '#aaa' }}>{track.artist?.displayName ?? '—'}</td>
                  <td style={{ ...td, color: '#ccc' }}>{track.playCount?.toLocaleString() ?? 0}</td>
                  <td style={td}>
                    <span style={{
                      padding: '4px 12px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600,
                      background: isHidden ? '#444' : '#ff550022',
                      color: isHidden ? '#999' : '#ff5500',
                      border: `1px solid ${isHidden ? '#555' : '#ff550044'}`,
                    }}>
                      {isHidden ? 'Draft' : 'Published'}
                    </span>
                  </td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <ActionIcon icon="✏️" title="Edit" />
                      <ActionIcon
                        icon="🗑️"
                        title={isHidden ? 'Restore' : 'Hide'}
                        onClick={() => setConfirmModal({ type: isHidden ? 'restore-track' : 'hide', id: track._id })}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', color: '#888', transition: 'color 150ms' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#ccc'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#888'}
                      >
                        <span style={{ fontSize: '0.9rem' }}>📢</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Promote</span>
                      </div>
                    </div>
                  </td>
                </tr>
              )
            }}
          />
          
          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', gap: '0.25rem' }}>
            <PageBtn label="<" disabled />
            <PageBtn label="1" active />
            <PageBtn label="2" />
            <PageBtn label="3" />
            <div style={{ padding: '0.5rem', color: '#666' }}>...</div>
            <PageBtn label="10" />
            <PageBtn label=">" />
          </div>
        </>
      )}

      {/* ── ACCOUNTS TAB ────────────────────────────────────────────── */}
      {activeTab === 'accounts' && (
        <>
          {/* Backend note banner */}
          <div style={{
            padding: '0.75rem 1rem', borderRadius: 8,
            background: '#3b82f611', border: '1px solid #3b82f633',
            color: '#3b82f6', fontSize: '0.8rem', marginBottom: '1rem',
          }}>
            ℹ <strong>Backend Required:</strong> A <code>GET /admin/users</code> endpoint with search &amp; pagination is needed for a full accounts list. Currently showing a placeholder — see API notes in the code comments.
          </div>

          <AdminTable
            columns={ACCOUNT_COLS}
            data={[]}
            isLoading={false}
            emptyMessage="No user list endpoint available. Backend must expose GET /admin/users."
            renderRow={() => null}
          />
        </>
      )}

      {/* Confirm modal */}
      <ConfirmModal
        open={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        onConfirm={doConfirm}
        isLoading={isPending}
        isDanger={confirmModal?.type !== 'restore-track' && confirmModal?.type !== 'restore-user'}
        title={
          confirmModal?.type?.includes('suspend') ? 'Suspend User' :
          confirmModal?.type?.includes('restore') ? 'Restore' :
          confirmModal?.type?.includes('bulk') ? 'Bulk Hide Tracks' : 'Hide Track'
        }
        confirmLabel={
          confirmModal?.type?.includes('restore') ? 'Restore' :
          confirmModal?.type?.includes('suspend') ? 'Suspend' : 'Hide'
        }
        message={confirmModal ? confirmMessages[confirmModal.type] ?? 'Confirm this action?' : ''}
      />
    </div>
  )
}

/* ─── helpers ──────────────────────────────────────────────────────────── */
function MiniBtn({ label, onClick, color, id }: { label: string; onClick: () => void; color: string; id: string }) {
  return (
    <button id={id} onClick={onClick} style={{
      padding: '3px 8px', borderRadius: 4, border: `1px solid ${color}44`,
      background: `${color}11`, color, fontSize: '0.72rem', fontWeight: 600,
      cursor: 'pointer', transition: 'all 150ms',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = `${color}22` }}
    onMouseLeave={(e) => { e.currentTarget.style.background = `${color}11` }}
    >
      {label}
    </button>
  )
}

function SearchInput({ value, onChange, placeholder, id }: {
  value: string; onChange: (v: string) => void; placeholder: string; id: string
}) {
  return (
    <div style={{ position: 'relative' }}>
      <svg
        style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#666' }}
        width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
      </svg>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: '#1a1a1a', border: '1px solid #333', borderRadius: 6,
          color: '#ccc', padding: '0.65rem 1rem 0.65rem 2.25rem',
          fontSize: '0.8rem', outline: 'none', width: 240,
        }}
      />
    </div>
  )
}

function FilterSelect({ label }: { label: string }) {
  return (
    <div style={{
      background: '#1a1a1a', border: '1px solid #333', borderRadius: 6,
      color: '#999', padding: '0.65rem 1rem', fontSize: '0.8rem', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: '0.5rem',
    }}>
      {label}
      <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}

function ActionIcon({ icon, title, onClick }: { icon: string; title: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick} title={title}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: '1.1rem', opacity: 0.6, transition: 'all 150ms', padding: 0,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1.1)' }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.transform = 'scale(1)' }}
    >
      {icon}
    </button>
  )
}

function PageBtn({ label, active, disabled }: { label: string; active?: boolean; disabled?: boolean }) {
  return (
    <button style={{
      background: active ? '#444' : '#1a1a1a',
      border: '1px solid #333', borderRadius: 4,
      color: active ? '#fff' : disabled ? '#555' : '#aaa',
      padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: active ? 700 : 500,
      cursor: disabled ? 'not-allowed' : 'pointer',
    }}>
      {label}
    </button>
  )
}

const td: React.CSSProperties = { padding: '1rem', color: '#ccc', verticalAlign: 'middle' }
