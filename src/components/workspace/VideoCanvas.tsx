import React, { useState, useEffect, useRef } from 'react';
import { Shot, VideoGeneration, AspectRatio } from '../../types';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Film,
  Sparkles,
  ArrowRight,
  Download,
  CheckCircle2,
  X,
  Layers,
  History,
  Check,
  ChevronRight,
  Zap,
  Trash2
} from 'lucide-react';

interface VideoCanvasProps {
  currentShot: Shot;
  nextShot?: Shot;
  availableKeyframes: { id: string; shotNumber: string; title: string; url: string }[];
  startFrameUrl: string;
  endFrameUrl?: string;
  onSetStartFrame: (url: string) => void;
  onSetEndFrame: (url?: string) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  generationProgress?: number;
  isGenerating?: boolean;
  onRegenerate: () => void;
  onApproveVideo: (generationId?: string) => void;
  onSelectVersion?: (version: VideoGeneration) => void;
  onDeleteVersion?: (versionId: string) => void;
}

export const VideoCanvas: React.FC<VideoCanvasProps> = ({
  currentShot,
  nextShot,
  availableKeyframes,
  startFrameUrl,
  endFrameUrl,
  onSetStartFrame,
  onSetEndFrame,
  isPlaying,
  onTogglePlay,
  generationProgress = 0,
  isGenerating = false,
  onRegenerate,
  onApproveVideo,
  onSelectVersion,
  onDeleteVersion
}) => {
  const [playbackTime, setPlaybackTime] = useState(0);
  const [isLooping, setIsLooping] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showKeyframePicker, setShowKeyframePicker] = useState<'start' | 'end' | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalDuration = currentShot.duration_seconds || 5;

  const activeVideoUrl = currentShot.video_url;
  const isVideoFile = activeVideoUrl && (activeVideoUrl.endsWith('.mp4') || activeVideoUrl.startsWith('blob:') || activeVideoUrl.includes('/api/video'));

  // Video playback timecode ticker for simulation/stills
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      if (videoRef.current && isVideoFile) {
        videoRef.current.play().catch(() => {});
      } else {
        interval = setInterval(() => {
          setPlaybackTime((prev) => {
            if (prev >= totalDuration) {
              return isLooping ? 0 : totalDuration;
            }
            return +(prev + 0.1).toFixed(1);
          });
        }, 100);
      }
    } else {
      if (videoRef.current && isVideoFile) {
        videoRef.current.pause();
      }
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration, isLooping, isVideoFile]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setPlaybackTime(+videoRef.current.currentTime.toFixed(1));
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const formatTimecode = (sec: number) => {
    const s = Math.floor(sec);
    const ms = Math.floor((sec - s) * 100);
    return `00:${s < 10 ? '0' : ''}${s}:${ms < 10 ? '0' : ''}${ms}`;
  };

  const videoGenerations = currentShot.video_generations || [];
  const activeVersion = videoGenerations.find(
    (g) => g.id === currentShot.selected_video_version_id || g.video_url === currentShot.video_url
  ) || videoGenerations[videoGenerations.length - 1];

  const isCurrentVideoApproved =
    currentShot.status === 'VIDEO_READY' ||
    currentShot.status === 'completed' ||
    (activeVersion && activeVersion.is_approved);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* ========================================================================= */}
      {/* SECTION 4: START & END KEYFRAMES VISUAL RELATIONSHIP BAR                 */}
      {/* ========================================================================= */}
      <div className="p-3 bg-[#101014] border border-white/[0.06] rounded-[16px]">
        <div className="flex items-center justify-between text-xs font-mono-code text-[#71717A] mb-2.5">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#C084FC]" />
            <span>KEYFRAME MOTION RELATIONSHIP</span>
          </div>
          <span className="text-[10px] text-[#A1A1AA]">
            {endFrameUrl ? 'Start → Motion → End Active' : 'Start Frame Motion Arc'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Start Frame Card */}
          <div className="flex-1 bg-[#15151B] border border-white/[0.08] rounded-[12px] p-2 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-14 aspect-video rounded-[6px] overflow-hidden bg-black/60 border border-white/[0.1] flex-shrink-0">
                {startFrameUrl ? (
                  <img
                    src={startFrameUrl}
                    alt="Start Frame"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[9px] text-[#71717A]">
                    No Frame
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-mono-code text-[#22C55E] uppercase block font-semibold">
                  START FRAME
                </span>
                <p className="text-xs text-[#FAFAFA] truncate font-medium">
                  {currentShot.shot_number} Approved Keyframe
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowKeyframePicker('start')}
              className="text-[10px] font-mono-code text-[#C084FC] hover:underline px-2 py-1 bg-[#1E1D27] rounded-[6px] transition-colors cursor-pointer"
            >
              Replace
            </button>
          </div>

          {/* Flow Indicator */}
          <div className="flex items-center justify-center text-[#A855F7] px-1">
            <ArrowRight className="w-4 h-4 animate-pulse" />
          </div>

          {/* End Frame Card */}
          <div className="flex-1 bg-[#15151B] border border-white/[0.08] rounded-[12px] p-2 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-14 aspect-video rounded-[6px] overflow-hidden bg-black/60 border border-white/[0.1] flex-shrink-0">
                {endFrameUrl ? (
                  <img
                    src={endFrameUrl}
                    alt="End Frame"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[9px] text-[#71717A] bg-black/30">
                    <span>Optional</span>
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-mono-code text-[#A1A1AA] uppercase block font-semibold">
                  END FRAME
                </span>
                <p className="text-xs text-[#FAFAFA] truncate font-medium">
                  {endFrameUrl ? (nextShot?.shot_number || 'Target Keyframe') : 'Single-Frame Motion'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {endFrameUrl ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowKeyframePicker('end')}
                    className="text-[10px] font-mono-code text-[#C084FC] hover:underline px-2 py-1 bg-[#1E1D27] rounded-[6px] transition-colors cursor-pointer"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => onSetEndFrame(undefined)}
                    className="p-1 text-[#71717A] hover:text-[#EF4444] transition-colors cursor-pointer"
                    title="Clear End Frame"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowKeyframePicker('end')}
                  className="text-[10px] font-mono-code text-[#FAFAFA] px-2.5 py-1 bg-[#1E1D27] hover:bg-[#282635] border border-white/[0.08] rounded-[6px] transition-colors cursor-pointer"
                >
                  + Add End Frame
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal for Selecting Approved Keyframe */}
        {showKeyframePicker && (
          <div className="mt-3 p-3 bg-[#0D0D10] border border-white/[0.08] rounded-[12px] space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs font-mono-code text-[#FAFAFA]">
              <span>Select Approved Keyframe for {showKeyframePicker === 'start' ? 'Start' : 'End'} State:</span>
              <button
                type="button"
                onClick={() => setShowKeyframePicker(null)}
                className="text-[#71717A] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto pr-1">
              {availableKeyframes.map((kf) => (
                <div
                  key={kf.id}
                  onClick={() => {
                    if (showKeyframePicker === 'start') {
                      onSetStartFrame(kf.url);
                    } else {
                      onSetEndFrame(kf.url);
                    }
                    setShowKeyframePicker(null);
                  }}
                  className="group relative aspect-video rounded-[8px] overflow-hidden border border-white/[0.08] hover:border-[#A855F7] cursor-pointer transition-all"
                >
                  <img
                    src={kf.url}
                    alt={kf.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-[10px] font-mono-code text-white font-bold">Select</span>
                  </div>
                  <div className="absolute bottom-1 left-1 px-1 bg-black/80 rounded text-[9px] font-mono-code text-white">
                    {kf.shotNumber}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: CINEMATIC VIDEO VIEWPORT                                       */}
      {/* ========================================================================= */}
      <div
        ref={containerRef}
        className="relative aspect-video w-full rounded-[22px] bg-[#0A0A0D] border border-white/[0.08] shadow-[0_24px_60px_rgba(0,0,0,0.85)] overflow-hidden flex items-center justify-center group"
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute inset-0 glow-ambient pointer-events-none opacity-30" />

        {/* Media Player Viewport */}
        {activeVideoUrl ? (
          isVideoFile ? (
            <video
              ref={videoRef}
              src={activeVideoUrl}
              loop={isLooping}
              muted={isMuted}
              onTimeUpdate={handleTimeUpdate}
              className="w-full h-full object-cover"
              playsInline
            />
          ) : (
            <div className="relative w-full h-full overflow-hidden">
              <img
                src={activeVideoUrl}
                alt={currentShot.title}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
                  isPlaying ? 'scale-105 filter brightness-105' : 'scale-100'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Atmospheric Motion Particles / Overlay */}
              {isPlaying && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full border border-[#A855F7]/30 animate-ping opacity-35" />
                </div>
              )}
            </div>
          )
        ) : startFrameUrl ? (
          <div className="relative w-full h-full">
            <img
              src={startFrameUrl}
              alt={currentShot.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#15151B]/90 border border-white/[0.1] text-[#A855F7] flex items-center justify-center mb-2 shadow-lg">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-display text-sm font-semibold text-[#FAFAFA]">
                Approved Keyframe Ready for Motion
              </h4>
              <p className="text-xs text-[#A1A1AA] max-w-sm mt-1">
                Configure motion direction on the right and click Generate Shot or Add to Queue.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center p-8">
            <Film className="w-12 h-12 text-[#71717A]/50 mx-auto mb-2" />
            <h4 className="font-display text-base font-semibold text-[#FAFAFA]">
              No Approved Keyframe Available
            </h4>
            <p className="text-xs text-[#71717A] max-w-xs mx-auto mt-1">
              Approve a keyframe in Keyframe Lab before synthesizing video motion.
            </p>
          </div>
        )}

        {/* Generating Overlay with Contextual Phase */}
        {isGenerating && (
          <div className="absolute inset-0 bg-[#09090B]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-30 animate-in fade-in duration-200">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-full border-2 border-[#A855F7]/20 border-t-[#A855F7] animate-spin" />
              <Film className="w-7 h-7 text-[#C084FC] absolute inset-0 m-auto animate-pulse" />
            </div>
            <h4 className="font-display text-base font-bold text-[#FAFAFA] tracking-tight">
              {generationProgress < 35
                ? 'Generating Motion Study…'
                : generationProgress < 70
                ? 'Interpolating Camera Physics…'
                : generationProgress < 95
                ? 'Synthesizing 4K Motion Vectors…'
                : 'Finalizing Film Buffer…'}
            </h4>
            <p className="text-xs text-[#A855F7] font-mono-code mt-1.5">
              Google Gemini / Veo 3.1 Pipeline · {generationProgress}%
            </p>
            <div className="w-64 h-1.5 bg-[#15151B] rounded-full overflow-hidden mt-3.5 border border-white/[0.08]">
              <div
                className="h-full bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#EC4899] transition-all duration-300"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Top Video Metadata Overlay */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-1 rounded-[8px] bg-black/75 backdrop-blur-md border border-white/[0.1] text-xs font-mono-code text-white">
            <span className="font-bold text-[#C084FC]">{currentShot.shot_number}</span>
            <span>·</span>
            <span>{currentShot.camera_movement || currentShot.camera_type}</span>
          </div>

          <div className="flex items-center gap-2">
            {activeVersion?.is_demo ? (
              <span className="px-2.5 py-1 rounded-[8px] bg-black/75 backdrop-blur-md border border-[#A855F7]/40 text-[10px] font-mono-code text-[#C084FC]">
                STUDIO PREVIEW
              </span>
            ) : activeVideoUrl ? (
              <span className="px-2.5 py-1 rounded-[8px] bg-black/75 backdrop-blur-md border border-[#22C55E]/40 text-[10px] font-mono-code text-[#22C55E]">
                GENERATED BY VEO
              </span>
            ) : null}

            <div className="px-3 py-1 rounded-[8px] bg-black/75 backdrop-blur-md border border-white/[0.1] text-xs font-mono-code text-white">
              {currentShot.model_target || 'Veo 3.1'}
            </div>
          </div>
        </div>

        {/* Big Center Play Overlay Button */}
        {!isPlaying && !isGenerating && activeVideoUrl && (
          <button
            type="button"
            onClick={onTogglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/35 group-hover:bg-black/45 transition-colors cursor-pointer"
            aria-label="Play video"
          >
            <div className="w-16 h-16 rounded-full bg-[#15151B]/95 border border-white/[0.2] text-[#FAFAFA] flex items-center justify-center shadow-[0_0_35px_rgba(139,92,246,0.35)] group-hover:scale-105 transition-transform">
              <Play className="w-6 h-6 ml-1 text-[#A855F7]" />
            </div>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 12: VIDEO VERSIONS STRIP (V1, V2, V3...)                          */}
      {/* ========================================================================= */}
      {videoGenerations.length > 0 && (
        <div className="p-3 bg-[#101014] border border-white/[0.06] rounded-[16px] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono-code text-[#71717A]">
            <div className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-[#C084FC]" />
              <span>MOTION VERSIONS ({videoGenerations.length})</span>
            </div>
            <span>Select version to preview or approve</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {videoGenerations.map((vg, idx) => {
              const isSelected = activeVersion?.id === vg.id || currentShot.video_url === vg.video_url;
              return (
                <div
                  key={vg.id || idx}
                  className={`group relative flex-shrink-0 w-28 aspect-video rounded-[10px] overflow-hidden border p-0.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#A855F7] ring-1 ring-[#A855F7]/40 shadow-sm'
                      : 'border-white/[0.08] opacity-75 hover:opacity-100'
                  }`}
                  onClick={() => onSelectVersion && onSelectVersion(vg)}
                >
                  <img
                    src={vg.video_url || startFrameUrl}
                    alt={`V${vg.version_number}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-[7px]"
                  />
                  <div className="absolute bottom-1 left-1.5 px-1 py-0.5 rounded bg-black/85 text-[9px] font-mono-code text-white">
                    V{vg.version_number} · {vg.duration_seconds}s
                  </div>
                  {vg.is_approved && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#22C55E] flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-black stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIDEO SCRUBBER & PLAYBACK CONTROLS BAR                                    */}
      {/* ========================================================================= */}
      <div className="p-4 bg-[#101014] border border-white/[0.06] rounded-[16px] space-y-3">
        {/* Timeline Scrubber */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono-code text-[#FAFAFA] min-w-[70px]">
            {formatTimecode(playbackTime)}
          </span>

          <div className="flex-1 relative py-2">
            <input
              type="range"
              min="0"
              max={totalDuration}
              step="0.1"
              value={playbackTime}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setPlaybackTime(val);
                if (videoRef.current && isVideoFile) {
                  videoRef.current.currentTime = val;
                }
              }}
              className="w-full h-1 bg-[#1F1E29] rounded-lg appearance-none cursor-pointer accent-[#A855F7]"
            />
          </div>

          <span className="text-xs font-mono-code text-[#71717A] min-w-[70px] text-right">
            {formatTimecode(totalDuration)}
          </span>
        </div>

        {/* Buttons Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/[0.04]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onTogglePlay}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#15151B] hover:bg-[#1E1D27] text-white rounded-[10px] text-xs font-medium border border-white/[0.08] transition-colors cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPlaybackTime(0);
                if (videoRef.current) videoRef.current.currentTime = 0;
              }}
              className="p-1.5 bg-[#15151B] hover:bg-[#1E1D27] text-[#A1A1AA] hover:text-white rounded-[10px] border border-white/[0.08] transition-colors cursor-pointer"
              title="Replay from start"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 bg-[#15151B] hover:bg-[#1E1D27] text-[#A1A1AA] hover:text-white rounded-[10px] border border-white/[0.08] transition-colors cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={handleFullscreen}
              className="p-1.5 bg-[#15151B] hover:bg-[#1E1D27] text-[#A1A1AA] hover:text-white rounded-[10px] border border-white/[0.08] transition-colors cursor-pointer"
              title="Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action Chain: Approve Video / Regenerate / Download */}
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

            {activeVideoUrl && (
              <button
                type="button"
                onClick={() => onApproveVideo(activeVersion?.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] text-xs font-medium transition-all cursor-pointer ${
                  isCurrentVideoApproved
                    ? 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40'
                    : 'bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white shadow-[0_0_14px_rgba(139,92,246,0.3)]'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isCurrentVideoApproved ? 'Approved Motion Shot' : 'Approve Video'}</span>
              </button>
            )}

            {activeVideoUrl && (
              <a
                href={activeVideoUrl}
                download={`${currentShot.shot_number}_motion.mp4`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#15151B] hover:bg-[#1E1D27] text-[#A1A1AA] hover:text-[#FAFAFA] rounded-[10px] text-xs font-medium border border-white/[0.08] transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            )}
          </div>
        </div>

        {/* Technical Metadata Beneath Player (Prompt 04 Section 3) */}
        <div className="pt-2 border-t border-white/[0.04] grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-mono-code text-[#71717A]">
          <div>
            <span className="block text-[#52525B]">SHOT:</span>
            <span className="text-[#A1A1AA]">{currentShot.shot_number} · {currentShot.title}</span>
          </div>
          <div>
            <span className="block text-[#52525B]">DURATION:</span>
            <span className="text-[#A1A1AA]">{totalDuration} SECONDS</span>
          </div>
          <div>
            <span className="block text-[#52525B]">ASPECT RATIO:</span>
            <span className="text-[#A1A1AA]">16:9 DCI</span>
          </div>
          <div>
            <span className="block text-[#52525B]">MODEL:</span>
            <span className="text-[#C084FC]">{currentShot.model_target || 'Veo 3.1'}</span>
          </div>
          <div>
            <span className="block text-[#52525B]">VERSION:</span>
            <span className="text-[#A1A1AA]">
              {activeVersion ? `V${activeVersion.version_number}` : 'V1 Draft'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
