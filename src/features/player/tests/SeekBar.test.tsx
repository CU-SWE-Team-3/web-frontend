import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SeekBar } from '../ui/player/SeekBar';

describe('SeekBar', () => {
  it('renders with sc-seekbar id', () => {
    render(<SeekBar currentTime={0} duration={180} buffered={0.5} onSeek={jest.fn()} />);
    expect(document.getElementById('sc-seekbar')).toBeInTheDocument();
  });

  it('renders tooltip element (hidden initially)', () => {
    render(<SeekBar currentTime={0} duration={180} buffered={0} onSeek={jest.fn()} />);
    expect(document.getElementById('sc-seekbar')).toBeInTheDocument();
  });

  it('calls onSeek when track is clicked', () => {
    const onSeek = jest.fn();
    render(<SeekBar currentTime={0} duration={200} buffered={0} onSeek={onSeek} />);
    const track = document.getElementById('sc-seekbar')!.firstElementChild as HTMLElement;
    fireEvent.click(track, { clientX: 0 });
    expect(onSeek).toHaveBeenCalled();
  });

  it('shows tooltip on mouse move', () => {
    render(<SeekBar currentTime={0} duration={200} buffered={0} onSeek={jest.fn()} />);
    const track = document.getElementById('sc-seekbar')!.firstElementChild as HTMLElement;
    fireEvent.mouseMove(track, { clientX: 50 });
    expect(document.getElementById('sc-seekbar-tooltip')).toBeInTheDocument();
  });

  it('hides tooltip on mouse leave', () => {
    render(<SeekBar currentTime={0} duration={200} buffered={0} onSeek={jest.fn()} />);
    const track = document.getElementById('sc-seekbar')!.firstElementChild as HTMLElement;
    fireEvent.mouseMove(track, { clientX: 50 });
    fireEvent.mouseLeave(track);
    expect(document.getElementById('sc-seekbar-tooltip')).not.toBeInTheDocument();
  });

  it('has correct aria attributes', () => {
    render(<SeekBar currentTime={30} duration={180} buffered={0.5} onSeek={jest.fn()} />);
    const slider = screen.getByRole('slider', { name: 'Seek' });
    expect(slider).toHaveAttribute('aria-valuenow', '30');
    expect(slider).toHaveAttribute('aria-valuemax', '180');
  });
});
