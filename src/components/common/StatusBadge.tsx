import React from 'react';
import { ShotStatus, VideoGenStatus } from '../../types';

interface StatusBadgeProps {
  status: ShotStatus | VideoGenStatus | string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', size = 'md' }) => {
  const norm = String(status).toUpperCase();

  let symbol = '○';
  let label = 'PLANNED';
  let textColor = 'text-[#71717A]';
  let glowStyle = '';

  if (norm === 'PLANNED' || norm === 'DRAFT') {
    symbol = '○';
    label = 'PLANNED';
    textColor = 'text-[#A1A1AA]';
  } else if (norm === 'KEYFRAME_READY' || norm === 'READY' || norm === 'COMPLETED') {
    symbol = '✦';
    label = 'KEYFRAME READY';
    textColor = 'text-[#C084FC]';
    glowStyle = 'drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]';
  } else if (norm === 'VIDEO_READY') {
    symbol = '▶';
    label = 'VIDEO READY';
    textColor = 'text-[#22C55E]';
    glowStyle = 'drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]';
  } else if (norm === 'IN_PROGRESS' || norm === 'GENERATING' || norm === 'PROCESSING') {
    symbol = '◌';
    label = 'IN PROGRESS';
    textColor = 'text-[#F59E0B] animate-pulse';
  } else if (norm === 'FAILED' || norm === 'ERROR') {
    symbol = '!';
    label = 'FAILED';
    textColor = 'text-[#EF4444]';
  } else {
    // Project status fallback like in_progress
    symbol = '•';
    label = norm.replace('_', ' ');
    textColor = 'text-[#A1A1AA]';
  }

  const textSizes = size === 'sm' ? 'text-[11px] font-mono-code' : 'text-xs font-mono-code';

  return (
    <span className={`inline-flex items-center gap-1.5 ${textSizes} ${textColor} ${glowStyle} ${className}`}>
      <span className="font-semibold text-xs leading-none shrink-0" aria-hidden="true">
        {symbol}
      </span>
      <span className="tracking-wider uppercase font-medium">{label}</span>
    </span>
  );
};
