import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ListeningHistory } from '../ui/history/ListeningHistory';
import type { HistoryEntry } from '../model/historyStore';

const makeEntries = (n: number): HistoryEntry[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `entry-${i}`,
    track: {
      id: `t${i}`,
      title: `Track ${i}`,
      artist: `Artist ${i}`,
      artworkUrl: `/art${i}.jpg`,
    },
    playedAt: new Date(Date.now() - i * 60000).toISOString(),
    durationPlayed: (i + 1) * 30,
  }));

describe('ListeningHistory', () => {
  it('renders sc-listening-history id', () => {
    render(<ListeningHistory history={[]} onDelete={jest.fn()} />);
    expect(document.getElementById('sc-listening-history')).toBeInTheDocument();
  });

  it('renders empty state when no history', () => {
    render(<ListeningHistory history={[]} onDelete={jest.fn()} />);
    expect(screen.getByText('No listening history')).toBeInTheDocument();
  });

  it('renders all history items with correct IDs', () => {
    const entries = makeEntries(5);
    render(<ListeningHistory history={entries} onDelete={jest.fn()} />);
    for (let i = 0; i < 5; i++) {
      expect(document.getElementById(`sc-history-item-${i}`)).toBeInTheDocument();
    }
  });

  it('renders sort control (sc-history-sort)', () => {
    render(<ListeningHistory history={makeEntries(2)} onDelete={jest.fn()} />);
    expect(document.getElementById('sc-history-sort')).toBeInTheDocument();
  });

  it('renders filter control (sc-history-filter)', () => {
    render(<ListeningHistory history={makeEntries(2)} onDelete={jest.fn()} />);
    expect(document.getElementById('sc-history-filter')).toBeInTheDocument();
  });

  it('calls onDelete when delete button clicked', () => {
    const onDelete = jest.fn();
    const entries = makeEntries(3);
    render(<ListeningHistory history={entries} onDelete={onDelete} />);
    fireEvent.click(document.getElementById('sc-history-delete-1')!);
    expect(onDelete).toHaveBeenCalledWith('entry-1');
  });

  it('renders load-more button when history exceeds pageSize', () => {
    const entries = makeEntries(25);
    render(<ListeningHistory history={entries} onDelete={jest.fn()} pageSize={20} />);
    expect(document.getElementById('sc-history-load-more')).toBeInTheDocument();
  });

  it('does not render load-more when all items visible', () => {
    render(<ListeningHistory history={makeEntries(5)} onDelete={jest.fn()} pageSize={20} />);
    expect(document.getElementById('sc-history-load-more')).not.toBeInTheDocument();
  });

  it('shows more items after load-more click', () => {
    const entries = makeEntries(25);
    render(<ListeningHistory history={entries} onDelete={jest.fn()} pageSize={20} />);
    fireEvent.click(document.getElementById('sc-history-load-more')!);
    expect(document.getElementById('sc-history-item-20')).toBeInTheDocument();
  });
});
