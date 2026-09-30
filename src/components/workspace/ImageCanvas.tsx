import React, { useState } from 'react';
import { Shot, KeyframeGeneration } from '../../types';
import {
  RotateCcw,
  Download,
  Check,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Layers,
  Sliders,
  CheckCircle2,
  Clock,
  History
} from 'lucide-react';

interface ImageCanvasProps {
  shot: Shot;
  isGenerating?: boolean;
  onRegenerate: () => void;
  onSave: () => void;
  onApprove?: () => void;
  isApproved?: boolean;
  generations?: KeyframeGeneration[];
  activeGenerationId?: string;
  onSelectGeneration?: (generation: KeyframeGeneration) => void;
  onPushToVideo?: () => void;
}

export const ImageCanvas: React.FC<ImageCanvasProps> = ({
  shot,
  isGenerating = false,
  onRegenerate,
  onSave,
  onApprove,
  isApproved = false,
  generations = [],
  activeGenerationId,
  onSelectGeneration,
  onPushToVideo
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    onSave();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const isCurrentShotApproved = isApproved || shot.status === 'KEYFRAME_READY' || shot.status === 'VIDEO_READY' || shot.status === 'completed';

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Top canvas controls bar */}
      <div className="flex items-center justify-between px-2 text-xs font-mono-code text-[#71717A]">
        <div className="flex items-center gap-3">
          <span className="text-[#FAFAFA] font-semibold">{shot.shot_number}</span>
          <span>·</span>
          <span className="truncate max-w-[200px] sm:max-w-[300px]">{shot.title}</span>
          <span>·</span>
          <span>16:9 FRAME</span>
          {isCurrentShotApproved && (
            <span className="flex items-center gap-1 text-[11px] text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-2 py-0.5 rounded-[6px]">
              <CheckCircle2 className="w-3 h-3" />
              <span>APPROVED</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGuidelines(!showGuidelines)}
            className={`px-2 py-1 rounded-[6px] border text-[11px] transition-colors cursor-pointer ${
              showGuidelines
                ? 'bg-[#1E1D27] border-[#A855F7]/40 text-[#FAFAFA]'
                : 'bg-[#101014] border-white/[0.06] text-[#71717A]'
            }`}
          >
            Guidelines
          </button>
          <div className="flex items-center gap-1 bg-[#101014] border border-white/[0.06] rounded-[6px] p-0.5">
            <button
              onClick={() => setZoomLevel((z) => Math.max(75, z - 25))}
              className="p-1 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="px-1 text-[10px] text-[#A1A1AA]">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(150, z + 25))}
              className="p-1 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="relative flex-1 min-h-[380px] lg:min-h-[480px] rounded-[22px] bg-[#0A0A0D] border border-white/[0.08] shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] overflow-hidden flex items-center justify-center group">
        {/* Subtle Ambient Glow */}
        <div className="absolute inset-0 glow-ambient pointer-events-none opacity-40" />

        {/* Image Display */}
        {shot.keyframe_url ? (
          <div
            className="w-full h-full flex items-center justify-center p-3 transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            <div className={`relative aspect-video max-w-full max-h-full rounded-[14px] overflow-hidden transition-all duration-300 ${
              isCurrentShotApproved
                ? 'shadow-[0_0_50px_rgba(139,92,246,0.3)] ring-1 ring-[#A855F7]/50 border border-[#A855F7]/40'
                : 'shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/[0.08]'
            }`}>
              <img
                src={shot.keyframe_url}
                alt={shot.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />

              {/* Composition Guidelines Overlay */}
              {showGuidelines && (
                <div className="absolute inset-0 pointer-events-none border border-[#A855F7]/30">
                  {/* Safe area boundary */}
                  <div className="absolute inset-4 border border-dashed border-white/15" />
                  {/* Rule of thirds grid lines */}
                  <div className="absolute left-1/3 top-0 bottom-0 w-[1px] bg-white/[0.08]" />
                  <div className="absolute right-1/3 top-0 bottom-0 w-[1px] bg-white/[0.08]" />
                  <div className="absolute top-1/3 left-0 right-0 h-[1px] bg-white/[0.08]" />
                  <div className="absolute bottom-1/3 left-0 right-0 h-[1px] bg-white/[0.08]" />
                  {/* Center reticle */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 border border-[#A855F7]/50 rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-[#A855F7] rounded-full" />
                  </div>
                </div>
              )}

              {/* Source of Truth Ribbon Overlay */}
              {isCurrentShotApproved && (
                <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-[#22C55E]/40 px-2.5 py-1 rounded-[8px] flex items-center gap-1.5 text-[10px] font-mono-code text-[#22C55E]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>APPROVED VISUAL SOURCE OF TRUTH</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center p-8">
            <Sparkles className="w-10 h-10 text-[#8B5CF6]/50 mx-auto mb-3 animate-pulse" />
            <h4 className="font-display text-base font-semibold text-[#FAFAFA]">
              No Keyframe Generated Yet
            </h4>
            <p className="text-xs text-[#71717A] max-w-xs mx-auto mt-1">
              Synthesize this shot using the generation panel on the right.
            </p>
          </div>
        )}

        {/* Generating Overlay with Contextual Progress */}
        {isGenerating && (
          <div className="absolute inset-0 bg-[#09090B]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-20 animate-in fade-in duration-200">
            <div className="relative mb-5">
              <div className="w-14 h-14 rounded-full border-2 border-[#A855F7]/20 border-t-[#A855F7] animate-spin" />
              <Sparkles className="w-6 h-6 text-[#C084FC] absolute inset-0 m-auto animate-pulse" />
            </div>
            <h4 className="font-display text-base font-bold text-[#FAFAFA] tracking-tight">
              Synthesizing Keyframe…
            </h4>
            <p className="text-xs text-[#C084FC] font-mono-code mt-1.5">
              Composing lighting, camera optics & materials
            </p>
            <div className="w-48 h-1 bg-[#15151B] rounded-full overflow-hidden mt-3 border border-white/[0.08]">
              <div className="h-full bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#EC4899] w-3/4 animate-pulse" />
            </div>
          </div>
        )}
      </div>

      {/* Version History Strip (if versions exist) */}
      {generations && generations.length > 1 && (
        <div className="p-3 bg-[#101014] border border-white/[0.06] rounded-[16px] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono-code text-[#71717A]">
            <div className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-[#C084FC]" />
              <span>KEYFRAME VARIANTS ({generations.length})</span>
            </div>
            <span>Click thumbnail to activate variant</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {generations.map((gen, idx) => {
              const isActive = (activeGenerationId && activeGenerationId === gen.id) || (!activeGenerationId && shot.keyframe_url === gen.image_url);
              return (
                <button
                  key={gen.id || idx}
                  type="button"
                  onClick={() => onSelectGeneration && onSelectGeneration(gen)}
                  className={`relative flex-shrink-0 w-24 aspect-video rounded-[10px] overflow-hidden border transition-all cursor-pointer ${
                    isActive
                      ? 'border-[#A855F7] ring-1 ring-[#A855F7]/40 shadow-sm'
                      : 'border-white/[0.08] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={gen.image_url}
                    alt={`Variant ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-black/80 text-[9px] font-mono-code text-white">
                    V{gen.version_number || idx + 1}
                  </div>
                  {gen.is_approved && (
                    <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#22C55E] flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-black stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Bar Below Canvas */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#101014] border border-white/[0.06] rounded-[16px]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#15151B] hover:bg-[#1E1D27] text-white rounded-[10px] text-xs font-medium border border-white/[0.08] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#C084FC]" />
            <span>Regenerate</span>
          </button>

          {onApprove && shot.keyframe_url && (
            <button
              type="button"
              onClick={onApprove}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] text-xs font-medium transition-all cursor-pointer ${
                isCurrentShotApproved
                  ? 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40'
                  : 'bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white shadow-[0_0_14px_rgba(139,92,246,0.3)]'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isCurrentShotApproved ? 'Approved Keyframe' : 'Approve Keyframe'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#15151B] hover:bg-[#1E1D27] text-white rounded-[10px] text-xs font-medium border border-white/[0.08] transition-colors cursor-pointer"
          >
            {savedSuccess ? (
              <Check className="w-3.5 h-3.5 text-[#22C55E]" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#A855F7]" />
            )}
            <span>{savedSuccess ? 'Saved' : 'Save Shot Settings'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {shot.keyframe_url && (
            <a
              href={shot.keyframe_url}
              download={`${shot.shot_number}_keyframe.jpg`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#15151B] hover:bg-[#1E1D27] text-[#A1A1AA] hover:text-[#FAFAFA] rounded-[10px] text-xs font-medium border border-white/[0.08] transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download 4K</span>
            </a>
          )}

          {onPushToVideo && (
            <button
              type="button"
              onClick={onPushToVideo}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#15151B] hover:bg-[#1E1D27] text-white border border-white/[0.08] rounded-[10px] text-xs font-medium transition-colors cursor-pointer"
            >
              <span>Push to Video Lab →</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
