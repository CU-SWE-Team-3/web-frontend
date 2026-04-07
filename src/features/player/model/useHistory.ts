'use client';

import { useHistoryStore } from './historyStore';

export function useHistory() {
  const recentlyPlayed    = useHistoryStore((s) => s.recentlyPlayed);
  const listeningHistory  = useHistoryStore((s) => s.listeningHistory);
  const addToHistory      = useHistoryStore((s) => s.addToHistory);
  const clearRecent       = useHistoryStore((s) => s.clearRecent);
  const deleteHistoryItem = useHistoryStore((s) => s.deleteHistoryItem);

  return { recentlyPlayed, listeningHistory, addToHistory, clearRecent, deleteHistoryItem };
}
