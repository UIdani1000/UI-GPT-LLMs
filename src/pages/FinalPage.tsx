import React, { useState, useEffect, useRef } from 'react';
import { useProject } from '../context/ProjectContext';
import { useRouter } from '../context/RouterContext';
import { GlowCard } from '../components/common/GlowCard';
import { ProgressIndicator } from '../components/common/ProgressIndicator';
import { Modal } from '../components/common/Modal';
import { finalAssemblyService } from '../services/finalAssemblyService';
import { Shot, TimelineClip, FinalAssemblyExport } from '../types';
import {
  Clapperboard,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Download,
  Film,
  ArrowUp,
  ArrowDown,
  Trash2,
  Sparkles,
  Scissors,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sliders,
  Layers,
  ArrowRight
} from 'lucide-react';

export const FinalPage: React.FC = () => {
  const { activeProject, updateActiveProject, showToast } = useProject();
  const { navigate } = useRouter();

  if (!activeProject) return null;

  // Initialize Timeline Clips from activeProject shots
  const [clips, setClips] = useState<TimelineClip[]>(() => {
    return activeProject.shots.map((s, idx) => ({
      id: `clip-${s.id}`,
      shotId: s.id,
      shotNumber: s.shot_number,
      title: s.title,
      thumbnailUrl: s.video_url || s.keyframe_url,
      videoUrl: s.video_url,
      durationSeconds: s.duration_seconds || 5,
      trimStartSeconds: 0,
      trimEndSeconds: 0,
      enabled: true,
      transition: 'Short Fade',
      order: idx
    }));
  });

  const [selectedClipId, setSelectedClipId] = useState<string>(clips[0]?.id || '');
  const [activePlaybackIndex, setActivePlaybackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackTime, setPlaybackTime] = useState<number>(0);

  // Export State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportResolution, setExportResolution] = useState<'1080p' | '4K'>('4K');
  const [exportState, setExportState] = useState<FinalAssemblyExport | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync clips with activeProject shots when shots change
  useEffect(() => {
    setClips((prev) => {
      const existingMap = new Map(prev.map((c) => [c.shotId, c]));
      return activeProject.shots.map((s, idx) => {
        const existing = existingMap.get(s.id);
        if (existing) {
          return {
            ...existing,
            shotNumber: s.shot_number,
            title: s.title,
            thumbnailUrl: s.video_url || s.keyframe_url,
            videoUrl: s.video_url,
            order: idx
          };
        }
        return {
          id: `clip-${s.id}`,
          shotId: s.id,
          shotNumber: s.shot_number,
          title: s.title,
          thumbnailUrl: s.video_url || s.keyframe_url,
          videoUrl: s.video_url,
          durationSeconds: s.duration_seconds || 5,
          trimStartSeconds: 0,
          trimEndSeconds: 0,
          enabled: true,
          transition: 'Short Fade',
          order: idx
        };
      });
    });
  }, [activeProject.shots]);

  const enabledClips = clips.filter((c) => c.enabled);
  const currentClip = enabledClips[activePlaybackIndex] || enabledClips[0];
  const selectedClip = clips.find((c) => c.id === selectedClipId) || clips[0];

  const totalRuntimeSeconds = enabledClips.reduce(
    (acc, c) => acc + Math.max(1, c.durationSeconds - c.trimStartSeconds - c.trimEndSeconds),
    0
  );

  // Sequential Playback Engine: advances from clip to clip
  useEffect(() => {
    let timer: any = null;
    if (isPlaying && currentClip) {
      const clipDuration = Math.max(
        1,
        currentClip.durationSeconds - currentClip.trimStartSeconds - currentClip.trimEndSeconds
      );

      timer = setInterval(() => {
        setPlaybackTime((prev) => {
          if (prev >= clipDuration) {
            // Auto-advance to next clip or loop back to first
            setActivePlaybackIndex((idx) => (idx + 1 < enabledClips.length ? idx + 1 : 0));
            return 0;
          }
          return +(prev + 0.1).toFixed(1);
        });
      }, 100);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentClip, enabledClips.length]);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setActivePlaybackIndex(0);
    setPlaybackTime(0);
    setIsPlaying(true);
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

  // Timeline Clip Management (Reorder, Trim, Enable/Disable)
  const moveClip = (index: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= clips.length) return;

    const reordered = [...clips];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    const updatedClips = reordered.map((c, idx) => ({ ...c, order: idx }));
    setClips(updatedClips);

    // Sync sequence order back to Project shots (Prompt 04 Section 17)
    const reorderedShotIds = updatedClips.map((c) => c.shotId);
    updateActiveProject((prev) => ({
      ...prev,
      shots: prev.shots
        .slice()
        .sort((a, b) => reorderedShotIds.indexOf(a.id) - reorderedShotIds.indexOf(b.id))
        .map((s, idx) => ({ ...s, shot_number: `K0${idx + 1}` }))
    }));

    showToast('Sequence timeline reordered', 'info');
  };

  const toggleClipEnabled = (clipId: string) => {
    setClips((prev) =>
      prev.map((c) => (c.id === clipId ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const updateSelectedClipTrim = (
    field: 'trimStartSeconds' | 'trimEndSeconds' | 'transition',
    value: any
  ) => {
    setClips((prev) =>
      prev.map((c) => (c.id === selectedClipId ? { ...c, [field]: value } : c))
    );
  };

  const handleExportFilm = async () => {
    setIsExporting(true);
    try {
      const result = await finalAssemblyService.exportSequence(
        activeProject,
        enabledClips,
        exportResolution
      );
      setExportState(result);
      showToast('Assembly manifest compiled', 'success');
    } catch {
      showToast('Export failed', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const formatTimecode = (sec: number) => {
    const s = Math.floor(sec);
    const ms = Math.floor((sec - s) * 100);
    return `00:${s < 10 ? '0' : ''}${s}:${ms < 10 ? '0' : ''}${ms}`;
  };

  if (activeProject.shots.length === 0) {
    return (
      <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
        <div className="pb-4 border-b border-white/[0.06] flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono-code text-[#A855F7] uppercase tracking-widest mb-1">
              <Clapperboard className="w-3.5 h-3.5" />
              <span>FINAL WORKSPACE · SEQUENCE ASSEMBLY</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#FAFAFA]">
              {activeProject.name} — Master Cut
            </h1>
            <p className="text-xs text-[#A1A1AA] mt-1 max-w-2xl leading-relaxed">
              Assemble synthesized shots into one seamless master sequence.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/projects/${activeProject.id}/storyboard`)}
            className="px-3.5 py-2 text-xs font-medium text-[#A1A1AA] hover:text-[#FAFAFA] bg-[#101014] hover:bg-[#15151B] border border-white/[0.06] rounded-[10px] transition-colors cursor-pointer"
          >
            ← Storyboard Sequence
          </button>
        </div>

        <ProgressIndicator project={activeProject} currentStep="final" />

        <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
          <GlowCard className="p-10 text-center space-y-6 bg-[#101014] border-white/[0.08] shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-[#181722] border border-[#A855F7]/30 flex items-center justify-center text-[#C084FC] mx-auto shadow-[0_0_24px_rgba(139,92,246,0.2)]">
              <Clapperboard className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#FAFAFA]">
                Sequence Timeline Empty
              </h2>
              <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-md mx-auto leading-relaxed">
                Your project doesn't have any shots in its storyboard yet. Build your shot sequence and generate visual media before assembling the final film.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(`/projects/${activeProject.id}/storyboard`)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#EC4899] text-white rounded-[12px] text-xs font-semibold shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:opacity-95 transition-all cursor-pointer active:scale-[0.98]"
              >
                <Film className="w-4 h-4" />
                <span>Open Storyboard Sequence</span>
              </button>
            </div>
          </GlowCard>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="pb-4 border-b border-white/[0.06] flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono-code text-[#A855F7] uppercase tracking-widest mb-1">
            <Clapperboard className="w-3.5 h-3.5" />
            <span>FINAL WORKSPACE · SEQUENCE ASSEMBLY</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#FAFAFA]">
            {activeProject.name} — Master Cut
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1 max-w-2xl leading-relaxed">
            Assemble synthesized shots into one seamless master sequence. Reorder timeline clips, configure non-destructive trims, and export assembly manifest.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/projects/${activeProject.id}/video`)}
            className="px-3.5 py-2 text-xs font-medium text-[#A1A1AA] hover:text-[#FAFAFA] bg-[#101014] hover:bg-[#15151B] border border-white/[0.06] rounded-[10px] transition-colors cursor-pointer"
          >
            ← Video Motion Lab
          </button>

          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#EC4899] hover:opacity-95 text-white rounded-[10px] text-xs font-semibold shadow-[0_0_24px_rgba(139,92,246,0.35)] transition-all cursor-pointer active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Export Film</span>
          </button>
        </div>
      </div>

      {/* Production Progress Indicator */}
      <ProgressIndicator project={activeProject} currentStep="final" />

      {/* ========================================================================= */}
      {/* MASTER CINEMATIC PREVIEW PLAYER (Prompt 04 Section 18)                     */}
      {/* ========================================================================= */}
      <div
        ref={containerRef}
        className="rounded-[22px] overflow-hidden bg-[#0A0A0D] border border-white/[0.08] shadow-[0_24px_60px_rgba(0,0,0,0.85)] relative group"
      >
        <div className="aspect-video w-full relative flex items-center justify-center">
          {currentClip?.thumbnailUrl ? (
            <img
              src={currentClip.thumbnailUrl}
              alt={currentClip.title}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
                isPlaying ? 'scale-[1.03] filter brightness-105' : 'scale-100'
              }`}
            />
          ) : (
            <div className="text-center p-6">
              <Film className="w-12 h-12 text-[#71717A]/40 mx-auto mb-2" />
              <p className="text-xs text-[#71717A]">No footage available for this sequence beat</p>
            </div>
          )}

          {/* Vignette / Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

          {/* Top Overlays */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1 bg-black/75 backdrop-blur-md rounded-[8px] border border-white/[0.1] text-xs font-mono-code text-white">
              <span className="font-bold text-[#C084FC]">{currentClip?.shotNumber}</span>
              <span>·</span>
              <span>{currentClip?.title}</span>
            </div>

            <div className="px-3 py-1 bg-black/75 backdrop-blur-md rounded-[8px] border border-white/[0.1] text-xs font-mono-code text-[#C084FC]">
              SEQUENCE BEAT {activePlaybackIndex + 1} OF {enabledClips.length}
            </div>
          </div>

          {/* Bottom Title Lockup */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between pointer-events-none">
            <div>
              <span className="font-display text-lg font-bold text-white tracking-tight">
                {activeProject.name}
              </span>
              <p className="text-xs text-[#A1A1AA] font-mono-code mt-0.5">
                {currentClip?.shotNumber} · {currentClip?.transition} · {currentClip?.durationSeconds}S
              </p>
            </div>

            <div className="text-right text-xs font-mono-code text-[#FAFAFA]">
              RUNTIME: {totalRuntimeSeconds}S / TARGET: {activeProject.target_length_seconds || 60}S
            </div>
          </div>

          {/* Center Play Overlay Button */}
          {!isPlaying && currentClip && (
            <button
              type="button"
              onClick={handleTogglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors cursor-pointer"
              aria-label="Play full film"
            >
              <div className="w-16 h-16 rounded-full bg-[#15151B]/95 border border-white/[0.2] text-white flex items-center justify-center shadow-[0_0_35px_rgba(139,92,246,0.35)] group-hover:scale-105 transition-transform">
                <Play className="w-6 h-6 ml-1 text-[#A855F7]" />
              </div>
            </button>
          )}
        </div>

        {/* Master Playback Controls Bar */}
        <div className="p-3.5 bg-[#101014] border-t border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTogglePlay}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#15151B] hover:bg-[#1E1D27] text-white rounded-[8px] text-xs font-medium border border-white/[0.08] transition-colors cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause Sequence' : 'Play Sequence'}</span>
            </button>

            <button
              type="button"
              onClick={handleRestart}
              className="p-1.5 bg-[#15151B] hover:bg-[#1E1D27] text-[#A1A1AA] hover:text-white rounded-[8px] border border-white/[0.08] transition-colors cursor-pointer"
              title="Restart from first beat"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 bg-[#15151B] hover:bg-[#1E1D27] text-[#A1A1AA] hover:text-white rounded-[8px] border border-white/[0.08] transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={handleFullscreen}
              className="p-1.5 bg-[#15151B] hover:bg-[#1E1D27] text-[#A1A1AA] hover:text-white rounded-[8px] border border-white/[0.08] transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono-code text-[#71717A]">
            <span>PLAYHEAD: {formatTimecode(playbackTime)}</span>
            <span>·</span>
            <span>TOTAL: {totalRuntimeSeconds}s</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* HORIZONTAL TIMELINE & CLIP INSPECTOR (Prompt 04 Section 17 & 19)          */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-code text-[#A1A1AA] uppercase tracking-wider">
              Sequence Timeline ({clips.length} Clips)
            </span>
            <span className="text-[10px] text-[#71717A]">
              Reorder, toggle, or trim clips below
            </span>
          </div>
          <span className="text-xs font-mono-code text-[#C084FC]">
            TOTAL RUNTIME: {totalRuntimeSeconds} SECONDS
          </span>
        </div>

        {/* Horizontal Timeline Strip */}
        <div className="p-3 bg-[#101014] border border-white/[0.06] rounded-[18px] overflow-x-auto">
          <div className="flex items-center gap-2.5 min-w-max pb-1">
            {clips.map((clip, idx) => {
              const isSelected = clip.id === selectedClipId;
              const isCurrentlyPlaying = currentClip?.id === clip.id;
              const hasVideo = !!clip.videoUrl;

              return (
                <div
                  key={clip.id}
                  onClick={() => setSelectedClipId(clip.id)}
                  className={`relative w-44 rounded-[12px] border p-2 transition-all cursor-pointer ${
                    !clip.enabled
                      ? 'opacity-40 bg-[#0D0D10] border-white/[0.04]'
                      : isSelected
                      ? 'bg-[#1E1D27] border-[#A855F7] ring-1 ring-[#A855F7]/40 shadow-lg'
                      : isCurrentlyPlaying
                      ? 'bg-[#181722] border-[#C084FC]/50'
                      : 'bg-[#15151B] border-white/[0.08] hover:border-white/[0.16]'
                  }`}
                >
                  {/* Clip Thumbnail */}
                  <div className="relative aspect-video w-full rounded-[8px] overflow-hidden bg-black/60 mb-2">
                    {clip.thumbnailUrl ? (
                      <img
                        src={clip.thumbnailUrl}
                        alt={clip.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-[#71717A]">
                        No Media
                      </div>
                    )}

                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono-code font-bold text-white">
                      {clip.shotNumber}
                    </div>

                    <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[9px] font-mono-code text-white">
                      {clip.durationSeconds}s
                    </div>
                  </div>

                  {/* Title & Metadata */}
                  <div className="space-y-1">
                    <h5 className="font-display text-xs font-medium text-[#FAFAFA] truncate">
                      {clip.title}
                    </h5>
                    <div className="flex items-center justify-between text-[10px] font-mono-code text-[#71717A]">
                      <span>{hasVideo ? 'Video' : 'Keyframe'}</span>
                      <span>{clip.transition}</span>
                    </div>
                  </div>

                  {/* Reorder Buttons */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.06]"
                  >
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveClip(idx, 'left')}
                        className="p-1 text-[#71717A] hover:text-white disabled:opacity-20 cursor-pointer"
                        title="Move left"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        disabled={idx === clips.length - 1}
                        onClick={() => moveClip(idx, 'right')}
                        className="p-1 text-[#71717A] hover:text-white disabled:opacity-20 cursor-pointer"
                        title="Move right"
                      >
                        →
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleClipEnabled(clip.id)}
                      className="p-1 text-[#71717A] hover:text-[#FAFAFA] transition-colors cursor-pointer"
                      title={clip.enabled ? 'Disable clip' : 'Enable clip'}
                    >
                      {clip.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-[#EF4444]" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Clip Inspector & Trim Settings (Prompt 04 Section 19) */}
        {selectedClip && (
          <GlowCard className="p-4 bg-[#121118] border-white/[0.08]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-16 aspect-video rounded-[8px] overflow-hidden bg-black/60 border border-white/[0.1] flex-shrink-0">
                  {selectedClip.thumbnailUrl && (
                    <img
                      src={selectedClip.thumbnailUrl}
                      alt={selectedClip.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono-code font-bold text-[#C084FC]">
                      {selectedClip.shotNumber}
                    </span>
                    <h4 className="font-display text-sm font-semibold text-[#FAFAFA]">
                      {selectedClip.title}
                    </h4>
                  </div>
                  <p className="text-[11px] font-mono-code text-[#71717A] mt-0.5">
                    Original Duration: {selectedClip.durationSeconds}s · Net: {Math.max(1, selectedClip.durationSeconds - selectedClip.trimStartSeconds - selectedClip.trimEndSeconds)}s
                  </p>
                </div>
              </div>

              {/* Trim Controls */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono-code">
                {/* Trim Start */}
                <div className="flex items-center gap-2">
                  <span className="text-[#A1A1AA]">TRIM START:</span>
                  <select
                    value={selectedClip.trimStartSeconds}
                    onChange={(e) => updateSelectedClipTrim('trimStartSeconds', parseFloat(e.target.value))}
                    className="px-2 py-1 bg-[#15151B] border border-white/[0.08] rounded-[6px] text-white outline-none cursor-pointer"
                  >
                    <option value={0}>0.0s (Full)</option>
                    <option value={0.5}>0.5s</option>
                    <option value={1.0}>1.0s</option>
                    <option value={1.5}>1.5s</option>
                  </select>
                </div>

                {/* Trim End */}
                <div className="flex items-center gap-2">
                  <span className="text-[#A1A1AA]">TRIM END:</span>
                  <select
                    value={selectedClip.trimEndSeconds}
                    onChange={(e) => updateSelectedClipTrim('trimEndSeconds', parseFloat(e.target.value))}
                    className="px-2 py-1 bg-[#15151B] border border-white/[0.08] rounded-[6px] text-white outline-none cursor-pointer"
                  >
                    <option value={0}>0.0s (Full)</option>
                    <option value={0.5}>0.5s</option>
                    <option value={1.0}>1.0s</option>
                    <option value={1.5}>1.5s</option>
                  </select>
                </div>

                {/* Transition */}
                <div className="flex items-center gap-2">
                  <span className="text-[#A1A1AA]">TRANSITION:</span>
                  <select
                    value={selectedClip.transition}
                    onChange={(e) => updateSelectedClipTrim('transition', e.target.value)}
                    className="px-2 py-1 bg-[#15151B] border border-white/[0.08] rounded-[6px] text-white outline-none cursor-pointer"
                  >
                    <option value="Cut">Cut</option>
                    <option value="Short Fade">Short Fade (0.5s)</option>
                  </select>
                </div>
              </div>
            </div>
          </GlowCard>
        )}
      </div>

      {/* ========================================================================= */}
      {/* EXPORT FILM MODAL (Prompt 04 Section 20 & 21)                              */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Master Film"
        subtitle="Compile the approved sequence timeline into a master production delivery."
        maxWidth="lg"
      >
        <div className="space-y-4">
          {/* Metadata Overview */}
          <div className="p-3 bg-[#15151B] border border-white/[0.06] rounded-[12px] space-y-2 text-xs font-mono-code">
            <div className="flex justify-between">
              <span className="text-[#71717A]">PROJECT:</span>
              <span className="text-[#FAFAFA] font-bold">{activeProject.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#71717A]">TOTAL SEQUENCE RUNTIME:</span>
              <span className="text-[#C084FC]">{totalRuntimeSeconds} SECONDS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#71717A]">ACTIVE CLIPS:</span>
              <span className="text-[#FAFAFA]">{enabledClips.length} BEATS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#71717A]">ASPECT RATIO:</span>
              <span className="text-[#FAFAFA]">{activeProject.aspect_ratio || '16:9'}</span>
            </div>
          </div>

          {/* Export Resolution */}
          <div>
            <label className="block text-xs font-mono-code text-[#A1A1AA] uppercase mb-1.5">
              Export Resolution
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['1080p', '4K'] as const).map((res) => (
                <button
                  key={res}
                  type="button"
                  onClick={() => setExportResolution(res)}
                  className={`py-2 text-xs font-mono-code rounded-[8px] border transition-colors cursor-pointer ${
                    exportResolution === res
                      ? 'bg-[#1E1D27] border-[#A855F7]/50 text-white font-bold'
                      : 'bg-[#15151B] border-white/[0.06] text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  {res === '4K' ? '4K DCI (3840×2160)' : '1080p FHD (1920×1080)'}
                </button>
              ))}
            </div>
          </div>

          {/* Export State Display (Honest and Accurate - Section 20 & 21) */}
          {exportState ? (
            <div className="p-3.5 bg-[#121118] border border-[#A855F7]/30 rounded-[12px] space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono-code text-[#C084FC]">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                <span>Export Configuration Registered</span>
              </div>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                {exportState.message}
              </p>
              <div className="text-[10px] font-mono-code text-[#71717A] pt-1">
                Edit Decision List (EDL) saved for {exportResolution} output.
              </div>
            </div>
          ) : (
            <div className="p-3 bg-[#121118] border border-white/[0.06] rounded-[10px] text-xs text-[#71717A] leading-relaxed">
              Export registers sequence order, clip transitions, and timing metadata into the production assembly boundary.
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsExportModalOpen(false)}
              className="px-3.5 py-1.5 text-xs text-[#A1A1AA] hover:text-white rounded-[8px]"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleExportFilm}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white rounded-[10px] text-xs font-medium shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all cursor-pointer disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>Registering Assembly...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Compile Master Assembly</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
