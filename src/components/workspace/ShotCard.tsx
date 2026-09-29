import React from 'react';
import { Shot } from '../../types';
import { GlowCard } from '../common/GlowCard';
import { StatusBadge } from '../common/StatusBadge';
import {
  Sparkles,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Maximize2
} from 'lucide-react';

interface ShotCardProps {
  shot: Shot;
  index: number;
  totalShots: number;
  selected?: boolean;
  onSelect?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onOpenKeyframeLab?: () => void;
}

export const ShotCard: React.FC<ShotCardProps> = ({
  shot,
  index,
  totalShots,
  selected = false,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onOpenKeyframeLab
}) => {
  const cameraLabel = shot.camera_movement || shot.camera_type || 'Macro';
  const lensLabel = shot.lens || shot.focal_length || '85mm';
  const durationLabel = `${shot.duration_seconds || 6} sec`;

  const purposeOrDescription =
    shot.purpose ||
    shot.visual_description ||
    `Reveal the physical presence of ${shot.title}.`;

  const hasKeyframe = !!shot.keyframe_url;

  return (
    <GlowCard
      selected={selected}
      interactive
      glow={selected ? 'subtle' : 'none'}
      onClick={onSelect}
      className="group relative overflow-hidden flex flex-col justify-between transition-all duration-200"
    >
      <div>
        {/* Frame Canvas Thumbnail (Film Board style) */}
        <div className="relative aspect-video w-full overflow-hidden bg-[#0A0A0D] border-b border-white/[0.06]">
          {hasKeyframe ? (
            <img
              src={shot.keyframe_url}
              alt={shot.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-b from-[#15151B] to-[#0A0A0D]">
              <div className="w-8 h-8 rounded-full bg-[#1E1D27] flex items-center justify-center text-[#A855F7] mb-1.5 border border-white/[0.06]">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-mono-code text-[#C084FC] font-semibold tracking-wider">
                KEYFRAME — NOT CREATED
              </span>
              <span className="text-[10px] text-[#71717A] mt-0.5">
                Ready for synthesis
              </span>
            </div>
          )}

          {/* Top Overlays */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
            <span className="px-2 py-0.5 rounded-[6px] bg-black/75 backdrop-blur-md border border-white/[0.1] text-xs font-mono-code font-bold text-white">
              {shot.shot_number}
            </span>
            <span className="px-2 py-0.5 rounded-[6px] bg-black/75 backdrop-blur-md border border-white/[0.1]">
              <StatusBadge status={shot.status} size="sm" />
            </span>
          </div>

          {/* Quick Hover Reorder / Duplicate Toolbar on Thumbnail */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          >
            <div className="flex items-center gap-1 bg-black/80 backdrop-blur-md rounded-[8px] p-1 border border-white/[0.1]">
              <button
                type="button"
                disabled={index === 0}
                onClick={onMoveUp}
                className="p-1 text-[#A1A1AA] hover:text-white disabled:opacity-30 cursor-pointer"
                title="Move Earlier in Sequence"
              >
                <ArrowUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                disabled={index === totalShots - 1}
                onClick={onMoveDown}
                className="p-1 text-[#A1A1AA] hover:text-white disabled:opacity-30 cursor-pointer"
                title="Move Later in Sequence"
              >
                <ArrowDown className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center gap-1 bg-black/80 backdrop-blur-md rounded-[8px] p-1 border border-white/[0.1]">
              <button
                type="button"
                onClick={onDuplicate}
                className="p-1 text-[#A1A1AA] hover:text-[#C084FC] cursor-pointer"
                title="Duplicate Shot"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="p-1 text-[#A1A1AA] hover:text-[#EF4444] cursor-pointer"
                title="Delete Shot"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Shot Card Body (Formatted exactly as requested) */}
        <div className="p-4 space-y-2">
          {/* Title */}
          <h4 className="font-display text-sm font-bold text-[#FAFAFA] tracking-tight group-hover:text-[#C084FC] transition-colors truncate">
            {shot.title}
          </h4>

          {/* Optics / Camera / Duration Metadata (Unboxed text with · separators) */}
          <div className="flex items-center gap-1.5 text-xs font-mono-code text-[#A1A1AA] truncate">
            <span>{cameraLabel}</span>
            <span aria-hidden="true" className="text-[#71717A]">·</span>
            <span>{lensLabel}</span>
            <span aria-hidden="true" className="text-[#71717A]">·</span>
            <span>{durationLabel}</span>
          </div>

          {/* Purpose / Visual Intent */}
          <p className="text-xs text-[#71717A] line-clamp-2 leading-relaxed">
            {purposeOrDescription}
          </p>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="px-4 py-2.5 border-t border-white/[0.05] bg-[#0E0E12] flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.();
          }}
          className="text-[#A1A1AA] hover:text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Maximize2 className="w-3 h-3" />
          <span>Edit Details</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenKeyframeLab?.();
          }}
          className="text-[#C084FC] hover:text-white font-medium flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3 h-3" />
          <span>Keyframe Lab</span>
        </button>
      </div>
    </GlowCard>
  );
};
