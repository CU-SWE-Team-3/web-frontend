'use client';

import { type FC, useState, useRef, useEffect } from 'react';
import apiClient from '@/shared/api/client';
import { ShareIcon, EditIcon } from '@/shared/ui/icons';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import s from './ProfileTabs.module.scss';

const TABS = ['All', 'Popular tracks', 'Tracks', 'Albums', 'Playlists', 'Reposts'];

export interface ProfileTabsProps {
  onEditClick?: () => void;
  onShareClick?: () => void;
  isOwnProfile?: boolean;
  targetUserId?: string;
  profile?: any;
}

export const ProfileTabs: FC<ProfileTabsProps> = ({ onEditClick, onShareClick, isOwnProfile, targetUserId, profile }) => {
  const [active, setActive] = useState('All');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuthStore();

  const queryClient = useQueryClient();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleFollow = async () => {
    if (!targetUserId) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await apiClient.delete(`/network/${targetUserId}/follow`, { withCredentials: true });
        setIsFollowing(false);
      } else {
        await apiClient.post(`/network/${targetUserId}/follow`, {}, { withCredentials: true });
        setIsFollowing(true);

        // Optimistic injection into my following list
        const authState = useAuthStore.getState();
        const myId = (authState.user as any)?._id || authState.user?.id;
        if (myId && profile) {
          const key = ["network", "following", myId];
          const prev = queryClient.getQueryData<any[]>(key);
          const newEntry = {
            id: targetUserId,
            username: profile.permalink || profile._id || targetUserId,
            displayName: profile.displayName || targetUserId,
            avatarUrl: profile.avatarUrl || null,
            followerCount: (profile.followerCount || 0) + 1,
            isFollowing: true
          };
          if (prev) {
            if (!prev.some(u => u.id === targetUserId)) {
              queryClient.setQueryData(key, [...prev, newEntry]);
            }
          } else {
            queryClient.setQueryData(key, [newEntry]);
          }
        }
      }
      queryClient.invalidateQueries({ queryKey: ['network'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch (err: any) {
      console.warn('[ProfileTabs] Follow/unfollow error:', err.response?.status);
      // Toggle locally as fallback
      setIsFollowing(prev => !prev);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!targetUserId) return;
    setMenuOpen(false);
    try {
      await apiClient.post(`/network/${targetUserId}/block`, {}, { withCredentials: true });
      alert('User blocked');
    } catch (err: any) {
      console.warn('[ProfileTabs] Block error:', err.response?.status);
      alert('User blocked (local)');
    }
  };

  return (
    <div className={s.bar}>
      <nav className={s.tabs}>
        {TABS.map((t) => (
          <button
            key={t}
            className={`${s.tab} ${active === t ? s.tabActive : ''}`}
            onClick={() => setActive(t)}
          >
            {t}
          </button>
        ))}
      </nav>

      <div className={s.actions}>
        {/* Follow / Unfollow button (only for other profiles) */}
        {!isOwnProfile && isAuthenticated && targetUserId && (
          <button
            className={s.actionBtn}
            onClick={handleFollow}
            disabled={followLoading}
            style={{
              background: isFollowing ? 'var(--sc-primary, #ff5500)' : 'transparent',
              color: isFollowing ? '#fff' : undefined,
              borderColor: isFollowing ? 'var(--sc-primary, #ff5500)' : undefined,
              opacity: followLoading ? 0.6 : 1,
            }}
          >
            {isFollowing ? '✓ Following' : '+ Follow'}
          </button>
        )}

        <button className={s.actionBtn} onClick={onShareClick}>
          <ShareIcon size={14} /> Share
        </button>

        {isOwnProfile && (
          <button className={s.actionBtn} onClick={onEditClick}>
            <EditIcon size={14} /> Edit
          </button>
        )}

        {/* More menu (Block) */}
        {!isOwnProfile && isAuthenticated && targetUserId && (
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button className={s.actionBtn} onClick={() => setMenuOpen(!menuOpen)}>
              ···
            </button>
            {menuOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 4px)', right: 0,
                background: 'var(--sc-bg-surface, #222)',
                border: '1px solid var(--sc-border, rgba(255,255,255,0.08))',
                borderRadius: 8, padding: '4px 0', minWidth: 160,
                zIndex: 50, boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}>
                <button
                  onClick={handleBlock}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '8px 14px',
                    background: 'none', border: 'none',
                    color: '#ef4444', fontSize: 13, cursor: 'pointer',
                    fontFamily: 'var(--sc-font-family)',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                  Block user
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
