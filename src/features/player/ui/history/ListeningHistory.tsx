'use client';

import { type FC, useState, useMemo } from 'react';
import { Trash2, ArrowUpDown, Filter } from 'lucide-react';
import type { HistoryEntry } from '../../model/historyStore';
import { formatTime, formatRelativeTime } from '../../lib/playbackUtils';
import s from './ListeningHistory.module.scss';

export type SortOption   = 'recent' | 'oldest' | 'title' | 'artist';
export type FilterOption = 'all' | 'today' | 'week' | 'month';

export interface ListeningHistoryProps {
  history: HistoryEntry[];
  onDelete: (id: string) => void;
  onPlay?: (entry: HistoryEntry) => void;
  pageSize?: number;
}

export const ListeningHistory: FC<ListeningHistoryProps> = ({
  history,
  onDelete,
  onPlay,
  pageSize = 20,
}) => {
  const [sortBy, setSortBy]         = useState<SortOption>('recent');
  const [filterBy, setFilterBy]     = useState<FilterOption>('all');
  const [displayCount, setDisplay]  = useState(pageSize);

  const filtered = useMemo(() => {
    const now = Date.now();
    const DAY  = 86_400_000;
    let items = [...history];

    if (filterBy === 'today') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      items = items.filter((e) => new Date(e.playedAt) >= start);
    } else if (filterBy === 'week') {
      items = items.filter((e) => now - new Date(e.playedAt).getTime() < 7 * DAY);
    } else if (filterBy === 'month') {
      items = items.filter((e) => now - new Date(e.playedAt).getTime() < 30 * DAY);
    }

    if (sortBy === 'recent')  items.sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime());
    if (sortBy === 'oldest')  items.sort((a, b) => new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime());
    if (sortBy === 'title')   items.sort((a, b) => a.track.title.localeCompare(b.track.title));
    if (sortBy === 'artist')  items.sort((a, b) => a.track.artist.localeCompare(b.track.artist));

    return items;
  }, [history, sortBy, filterBy]);

  const displayed = filtered.slice(0, displayCount);
  const hasMore   = displayCount < filtered.length;

  return (
    <div id="sc-listening-history" className={s.root}>
      <div className={s.header}>
        <h2 className={s.title}>Listening History</h2>
        <div className={s.controls}>
          {/* Sort */}
          <div className={s.selectWrap}>
            <label htmlFor="sc-history-sort" className="sr-only">Sort by</label>
            <select
              id="sc-history-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className={s.select}
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A–Z</option>
              <option value="artist">Artist A–Z</option>
            </select>
            <ArrowUpDown size={12} className={s.selectIcon} />
          </div>

          {/* Filter */}
          <div className={s.selectWrap}>
            <label htmlFor="sc-history-filter" className="sr-only">Filter by</label>
            <select
              id="sc-history-filter"
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterOption)}
              className={s.select}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <Filter size={12} className={s.selectIcon} />
          </div>
        </div>
      </div>

      {displayed.length === 0 ? (
        <p className={s.empty}>No listening history</p>
      ) : (
        <div className={s.list}>
          {displayed.map((entry, index) => (
            <div
              key={entry.id}
              id={`sc-history-item-${index}`}
              className={s.row}
              onClick={() => onPlay?.(entry)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onPlay?.(entry)}
            >
              <div className={s.thumb}>
                <img src={entry.track.artworkUrl} alt={entry.track.title} className={s.thumbImg} />
              </div>
              <div className={s.info}>
                <span className={s.trackTitle}>{entry.track.title}</span>
                <span className={s.artist}>{entry.track.artist}</span>
              </div>
              <span className={s.meta}>{formatRelativeTime(entry.playedAt)}</span>
              <span className={s.duration}>{formatTime(entry.durationPlayed)}</span>
              <button
                id={`sc-history-delete-${index}`}
                className={s.deleteBtn}
                onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                aria-label={`Delete ${entry.track.title} from history`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <button
          id="sc-history-load-more"
          className={s.loadMore}
          onClick={() => setDisplay((prev) => prev + pageSize)}
        >
          Load more ({filtered.length - displayCount} remaining)
        </button>
      )}
    </div>
  );
};
