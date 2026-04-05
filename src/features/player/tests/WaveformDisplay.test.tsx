import React from 'react';
import { render, screen } from '@testing-library/react';
import { WaveformDisplay } from '../ui/player/WaveformDisplay';

describe('WaveformDisplay', () => {
  it('renders sc-waveform id', () => {
    render(<WaveformDisplay currentTime={0} duration={180} onSeek={jest.fn()} />);
    expect(document.getElementById('sc-waveform')).toBeInTheDocument();
  });

  it('renders a canvas element', () => {
    render(<WaveformDisplay currentTime={0} duration={180} onSeek={jest.fn()} />);
    expect(document.getElementById('sc-waveform')!.querySelector('canvas')).toBeInTheDocument();
  });

  it('has correct aria role', () => {
    render(<WaveformDisplay currentTime={30} duration={180} onSeek={jest.fn()} />);
    const slider = screen.getByRole('slider', { name: 'Waveform seek' });
    expect(slider).toHaveAttribute('aria-valuenow', '30');
    expect(slider).toHaveAttribute('aria-valuemax', '180');
  });

  it('calls onSeek when clicked', () => {
    const onSeek = jest.fn();
    render(<WaveformDisplay currentTime={0} duration={180} onSeek={onSeek} />);
    const el = document.getElementById('sc-waveform')!;
    el.click();
    expect(onSeek).toHaveBeenCalled();
  });
});
