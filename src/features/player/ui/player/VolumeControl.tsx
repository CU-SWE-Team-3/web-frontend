'use client';

import { type FC } from 'react';
import { Volume2, Volume1, VolumeX } from 'lucide-react';
import s from './VolumeControl.module.scss';

export interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (level: number) => void;
  onToggleMute: () => void;
}

export const VolumeControl: FC<VolumeControlProps> = ({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
}) => {
  const effective = isMuted ? 0 : volume;

  const Icon =
    isMuted || effective === 0
      ? VolumeX
      : effective < 0.5
        ? Volume1
        : Volume2;

  return (
    <div id="sc-volume-control" className={s.wrap}>
      <button
        id="sc-btn-mute"
        onClick={onToggleMute}
        className={s.muteBtn}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        <Icon size={18} />
      </button>
      <input
        id="sc-volume-slider"
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={effective}
        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
        className={s.slider}
        aria-label="Volume"
      />
    </div>
  );
};
