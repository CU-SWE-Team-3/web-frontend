import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VolumeControl } from '../ui/player/VolumeControl';

describe('VolumeControl', () => {
  it('renders sc-volume-control id', () => {
    render(<VolumeControl volume={0.8} isMuted={false} onVolumeChange={jest.fn()} onToggleMute={jest.fn()} />);
    expect(document.getElementById('sc-volume-control')).toBeInTheDocument();
  });

  it('renders sc-volume-slider', () => {
    render(<VolumeControl volume={0.8} isMuted={false} onVolumeChange={jest.fn()} onToggleMute={jest.fn()} />);
    expect(document.getElementById('sc-volume-slider')).toBeInTheDocument();
  });

  it('renders sc-btn-mute', () => {
    render(<VolumeControl volume={0.8} isMuted={false} onVolumeChange={jest.fn()} onToggleMute={jest.fn()} />);
    expect(document.getElementById('sc-btn-mute')).toBeInTheDocument();
  });

  it('calls onToggleMute when mute button clicked', () => {
    const onToggleMute = jest.fn();
    render(<VolumeControl volume={0.8} isMuted={false} onVolumeChange={jest.fn()} onToggleMute={onToggleMute} />);
    fireEvent.click(screen.getByLabelText('Mute'));
    expect(onToggleMute).toHaveBeenCalledTimes(1);
  });

  it('shows Unmute label when muted', () => {
    render(<VolumeControl volume={0.8} isMuted={true} onVolumeChange={jest.fn()} onToggleMute={jest.fn()} />);
    expect(screen.getByLabelText('Unmute')).toBeInTheDocument();
  });

  it('calls onVolumeChange when slider changes', () => {
    const onVolumeChange = jest.fn();
    render(<VolumeControl volume={0.8} isMuted={false} onVolumeChange={onVolumeChange} onToggleMute={jest.fn()} />);
    fireEvent.change(document.getElementById('sc-volume-slider')!, { target: { value: '0.5' } });
    expect(onVolumeChange).toHaveBeenCalledWith(0.5);
  });

  it('slider value is 0 when muted', () => {
    render(<VolumeControl volume={0.8} isMuted={true} onVolumeChange={jest.fn()} onToggleMute={jest.fn()} />);
    expect(document.getElementById('sc-volume-slider')).toHaveValue('0');
  });
});
