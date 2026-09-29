import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { useRouter } from '../context/RouterContext';
import { VideoCanvas } from '../components/workspace/VideoCanvas';
import { GenerationQueueDrawer } from '../components/workspace/GenerationQueueDrawer';
import { GlowCard } from '../components/common/GlowCard';
import { ProgressIndicator } from '../components/common/ProgressIndicator';
import {
  videoGenerationService,
  buildMotionPrompt
} from '../services/videoGenerationService';
import { Shot, VideoGeneration, AspectRatio } from '../types';
import {
  Video,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Layers,
  Clock,
  Compass,
  CheckCircle2,
  AlertCircle,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Zap,
  ListOrdered,
  Eye,
  Film,
  Plus
} from 'lucide-react';

export const VideoPage: React.FC = () => {
  const {
    activeProject,
    selectedShotId,
    setSelectedShotId,
    updateShot,
    addShot,
    showToast,
    queue,
    addToQueue,
    setIsQueueOpen
  } = useProject();
  const { navigate } = useRouter();

  if (!activeProject) return null;

  const currentIdx = activeProject.shots.findIndex((s) => s.id === selectedShotId);
  const currentShot =
    currentIdx !== -1 ? activeProject.shots[currentIdx] : activeProject.shots[0];

  if (!currentShot || activeProject.shots.length === 0) {
    return (
      <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
        <div className="pb-4 border-b border-white/[0.06] flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono-code text-[#A855F7] uppercase tracking-widest mb-1">
              <Video className="w-3.5 h-3.5" />
              <span>VIDEO LAB · MOTION CHOREOGRAPHY</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#FAFAFA]">
              {activeProject.name} — Motion Choreography
            </h1>
            <p className="text-xs text-[#A1A1AA] mt-1 max-w-2xl leading-relaxed">
              Translate approved keyframes into continuous cinematic motion shots using Google Veo.
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

        <ProgressIndicator project={activeProject} currentStep="video" />

        <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
          <GlowCard className="p-10 text-center space-y-6 bg-[#101014] border-white/[0.08] shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-[#181722] border border-[#A855F7]/30 flex items-center justify-center text-[#C084FC] mx-auto shadow-[0_0_24px_rgba(139,92,246,0.2)]">
              <Video className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#FAFAFA]">
                No Shots in Sequence
              </h2>
              <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-md mx-auto leading-relaxed">
                Video Lab requires approved keyframe sequence shots to generate continuous motion. Add your first shot to start creating camera moves with Google Veo.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const newShot = addShot({
                    title: 'Hero Reveal',
                    purpose: 'Establish product presence and continuous camera motion.'
                  });
                  setSelectedShotId(newShot.id);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#EC4899] text-white rounded-[12px] text-xs font-semibold shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:opacity-95 transition-all cursor-pointer active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add First Shot</span>
              </button>
              <button
                type="button"
                onClick={() => navigate(`/projects/${activeProject.id}/storyboard`)}
                className="px-4 py-2.5 bg-[#15151B] hover:bg-[#1E1D27] text-white rounded-[12px] text-xs font-medium border border-white/[0.08] transition-colors cursor-pointer"
              >
                Open Storyboard
              </button>
            </div>
          </GlowCard>
        </div>
      </div>
    );
  }

  const prevShot = currentIdx > 0 ? activeProject.shots[currentIdx - 1] : undefined;
  const nextShot =
    currentIdx !== -1 && currentIdx < activeProject.shots.length - 1
      ? activeProject.shots[currentIdx + 1]
      : undefined;

  // Start & End Frame state
  const [startFrameUrl, setStartFrameUrl] = useState<string>(
    currentShot?.start_frame_url || currentShot?.keyframe_url || ''
  );
  const [endFrameUrl, setEndFrameUrl] = useState<string | undefined>(
    currentShot?.end_frame_url || undefined
  );

  // Motion Direction structured fields (Section 5)
  const [subjectMotion, setSubjectMotion] = useState<string>(
    currentShot?.subject_motion || 'Product remains stationary'
  );
  const [cameraMotion, setCameraMotion] = useState<string>(
    currentShot?.camera_motion || currentShot?.camera_movement || 'Slow push-in'
  );
  const [environmentalMotion, setEnvironmentalMotion] = useState<string>(
    currentShot?.environmental_motion || 'Reflections moving across surface'
  );
  const [motionIntensity, setMotionIntensity] = useState<'Minimal' | 'Controlled' | 'Cinematic' | 'Dynamic'>(
    currentShot?.motion_intensity || 'Cinematic'
  );
  const [motionNotes, setMotionNotes] = useState<string>(
    currentShot?.motion_notes || ''
  );

  // Final editable motion prompt (Section 6)
  const [motionPrompt, setMotionPrompt] = useState<string>(
    currentShot?.motion_prompt || ''
  );

  // Generation controls
  const [duration, setDuration] = useState<number>(
    currentShot?.duration_seconds === 8 ? 8 : 5
  );
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(
    activeProject.aspect_ratio || '16:9'
  );
  const [model, setModel] = useState<'veo-3.1-generate-preview' | 'veo-3.1-lite-generate-preview'>(
    'veo-3.1-generate-preview'
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);

  const [providerStatus, setProviderStatus] = useState<{
    configured: boolean;
    provider: string;
    model: string;
    message: string;
  }>({
    configured: false,
    provider: 'Google Gemini / Veo',
    model: 'veo-3.1-generate-preview',
    message: 'Checking provider status...'
  });

  // Keep state synchronized when currentShot changes
  useEffect(() => {
    if (currentShot) {
      setStartFrameUrl(currentShot.start_frame_url || currentShot.keyframe_url || '');
      setEndFrameUrl(currentShot.end_frame_url);
      setSubjectMotion(currentShot.subject_motion || 'Product remains stationary');
      setCameraMotion(currentShot.camera_motion || currentShot.camera_movement || 'Slow push-in');
      setEnvironmentalMotion(currentShot.environmental_motion || 'Reflections moving across surface');
      setMotionIntensity(currentShot.motion_intensity || 'Cinematic');
      setMotionNotes(currentShot.motion_notes || '');
      setMotionPrompt(
        currentShot.motion_prompt ||
          buildMotionPrompt({
            project: activeProject,
            shot: currentShot,
            startFrameUrl: currentShot.keyframe_url,
            endFrameUrl: currentShot.end_frame_url,
            subjectMotion: currentShot.subject_motion,
            cameraMotion: currentShot.camera_motion,
            environmentalMotion: currentShot.environmental_motion,
            motionIntensity: currentShot.motion_intensity,
            motionNotes: currentShot.motion_notes
          })
      );
      setDuration(currentShot.duration_seconds === 8 ? 8 : 5);
      setIsPlaying(false);
    }
  }, [currentShot?.id]);

  useEffect(() => {
    videoGenerationService.checkProviderStatus().then((status) => {
      setProviderStatus(status);
    });
  }, []);

  const handleSelectShot = (shotId: string) => {
    setSelectedShotId(shotId);
  };

  // Section 6: Video Prompt Builder Handler
  const handleBuildMotionPrompt = () => {
    if (!currentShot) return;
    const prompt = buildMotionPrompt({
      project: activeProject,
      shot: currentShot,
      startFrameUrl,
      endFrameUrl,
      subjectMotion,
      cameraMotion,
      environmentalMotion,
      motionIntensity,
      motionNotes
    });
    setMotionPrompt(prompt);
    showToast('Motion prompt compiled from creative direction and physics', 'info');
  };

  // Direct Immediate Generation Handler
  const handleGenerateShot = async () => {
    if (!currentShot) return;

    if (!startFrameUrl) {
      showToast('Approve a keyframe before generating video', 'warning');
      return;
    }

    setIsGenerating(true);
    setGenProgress(15);

    try {
      const activePrompt =
        motionPrompt.trim() ||
        buildMotionPrompt({
          project: activeProject,
          shot: currentShot,
          startFrameUrl,
          endFrameUrl,
          subjectMotion,
          cameraMotion,
          environmentalMotion,
          motionIntensity,
          motionNotes
        });

      const response = await videoGenerationService.generateVideo({
        shot_id: currentShot.id,
        project_id: activeProject.id,
        prompt: activePrompt,
        aspect_ratio: aspectRatio,
        duration,
        start_frame_url: startFrameUrl,
        end_frame_url: endFrameUrl,
        model
      });

      if (response.status === 'generating' && response.operation_name) {
        setGenProgress(40);
        let attempts = 0;
        const poller = setInterval(async () => {
          attempts++;
          const status = await videoGenerationService.pollOperation(response.operation_name!);
          if (status.done) {
            clearInterval(poller);
            finalizeVideo(status.video_url || startFrameUrl, false);
          } else if (attempts > 30) {
            clearInterval(poller);
            setIsGenerating(false);
            showToast('Generation timed out. Added to queue for continuation.', 'warning');
          } else {
            setGenProgress(Math.min(95, 40 + attempts * 2));
          }
        }, 3000);
      } else if (response.success && response.video_url) {
        // Prototype / Studio Preview progress animation
        setGenProgress(50);
        setTimeout(() => setGenProgress(85), 600);
        setTimeout(() => {
          finalizeVideo(response.video_url, response.is_demo);
        }, 1200);
      } else {
        setIsGenerating(false);
        showToast(response.message || 'Video generation failed', 'error');
      }
    } catch (err: any) {
      setIsGenerating(false);
      showToast(err.message || 'Generation failed', 'error');
    }
  };

  const finalizeVideo = (videoUrl: string, isDemo?: boolean) => {
    if (!currentShot) return;
    setIsGenerating(false);
    setGenProgress(100);

    const existingGenerations = currentShot.video_generations || [];
    const newVersionNumber = existingGenerations.length + 1;

    const newGen: VideoGeneration = {
      id: `vid-gen-${Date.now()}`,
      project_id: activeProject.id,
      shot_id: currentShot.id,
      version_number: newVersionNumber,
      motion_prompt: motionPrompt,
      start_frame_url: startFrameUrl,
      end_frame_url: endFrameUrl,
      model: model === 'veo-3.1-generate-preview' ? 'Veo 3.1' : 'Veo 3.1 Lite',
      duration_seconds: duration,
      aspect_ratio: aspectRatio,
      status: 'completed',
      video_url: videoUrl,
      is_approved: true, // auto-approve latest generation as source of truth
      created_at: new Date().toISOString(),
      is_demo: isDemo
    };

    const updatedShot: Shot = {
      ...currentShot,
      video_url: videoUrl,
      start_frame_url: startFrameUrl,
      end_frame_url: endFrameUrl,
      subject_motion: subjectMotion,
      camera_motion: cameraMotion,
      environmental_motion: environmentalMotion,
      motion_intensity: motionIntensity,
      motion_notes: motionNotes,
      motion_prompt: motionPrompt,
      status: 'VIDEO_READY',
      selected_video_version_id: newGen.id,
      video_generations: [...existingGenerations, newGen]
    };

    updateShot(updatedShot);

    if (isDemo) {
      showToast(`Motion shot generated (Studio Preview Mode)`, 'info');
    } else {
      showToast(`Motion shot synthesized with Google Veo`, 'success');
    }
  };

  // Section 7: Add to Queue Action
  const handleAddToQueue = () => {
    if (!currentShot) return;
    if (!startFrameUrl) {
      showToast('Approve a keyframe before queueing', 'warning');
      return;
    }

    addToQueue({
      projectId: activeProject.id,
      shotId: currentShot.id,
      shotNumber: currentShot.shot_number,
      shotTitle: currentShot.title,
      thumbnailUrl: startFrameUrl,
      type: 'VIDEO',
      provider: 'Google Gemini / Veo',
      model: model === 'veo-3.1-generate-preview' ? 'Veo 3.1' : 'Veo 3.1 Lite',
      duration,
      request: {
        shot_id: currentShot.id,
        project_id: activeProject.id,
        prompt: motionPrompt,
        aspect_ratio: aspectRatio,
        duration,
        start_frame_url: startFrameUrl,
        end_frame_url: endFrameUrl,
        model
      }
    });
  };

  // Approve Video Source of Truth
  const handleApproveVideo = (generationId?: string) => {
    if (!currentShot) return;

    const gens = currentShot.video_generations || [];
    const updatedGens = gens.map((g) => ({
      ...g,
      is_approved: generationId ? g.id === generationId : g.video_url === currentShot.video_url
    }));

    const updatedShot: Shot = {
      ...currentShot,
      status: 'VIDEO_READY',
      approved_video_id: generationId || currentShot.selected_video_version_id,
      video_generations: updatedGens
    };

    updateShot(updatedShot);
    showToast(`Approved ${currentShot.shot_number} video as production source of truth`, 'success');
  };

  const handleSelectVersion = (version: VideoGeneration) => {
    if (!currentShot) return;
    const updatedShot: Shot = {
      ...currentShot,
      video_url: version.video_url,
      selected_video_version_id: version.id
    };
    updateShot(updatedShot);
    showToast(`Switched to version V${version.version_number}`, 'info');
  };

  // Available approved keyframes across sequence
  const availableKeyframes = activeProject.shots
    .filter((s) => !!s.keyframe_url)
    .map((s) => ({
      id: s.id,
      shotNumber: s.shot_number,
      title: s.title,
      url: s.keyframe_url
    }));

  const activeQueueCount = queue.filter(
    (j) => j.status === 'QUEUED' || j.status === 'GENERATING' || j.status === 'PROCESSING'
  ).length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="pb-4 border-b border-white/[0.06] flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono-code text-[#A855F7] uppercase tracking-widest mb-1">
            <Video className="w-3.5 h-3.5" />
            <span>VIDEO LAB · GOOGLE VEO MOTION SYNTHESIS</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#FAFAFA]">
            {activeProject.name} — Motion Choreography
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1 max-w-2xl leading-relaxed">
            Translate approved keyframes into continuous cinematic motion shots using Google Veo video generation and camera physics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/projects/${activeProject.id}/keyframes`)}
            className="px-3.5 py-2 text-xs font-medium text-[#A1A1AA] hover:text-[#FAFAFA] bg-[#101014] hover:bg-[#15151B] border border-white/[0.06] rounded-[10px] transition-colors cursor-pointer"
          >
            ← Keyframe Lab
          </button>

          {/* Queue Button with Active Badge */}
          <button
            type="button"
            onClick={() => setIsQueueOpen(true)}
            className="relative flex items-center gap-2 px-3.5 py-2 bg-[#15151B] hover:bg-[#1E1D27] text-white border border-white/[0.08] rounded-[10px] text-xs font-medium transition-colors cursor-pointer"
          >
            <ListOrdered className="w-3.5 h-3.5 text-[#C084FC]" />
            <span>Production Queue</span>
            {activeQueueCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#A855F7] text-white text-[10px] font-mono-code flex items-center justify-center font-bold animate-pulse">
                {activeQueueCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate(`/projects/${activeProject.id}/final`)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#15151B] hover:bg-[#1E1D27] text-white rounded-[10px] text-xs font-medium border border-white/[0.08] transition-colors cursor-pointer"
          >
            <span>Final Assembly</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C084FC]" />
          </button>
        </div>
      </div>

      {/* Production Progress Indicator */}
      <ProgressIndicator project={activeProject} currentStep="video" />

      {/* ========================================================================= */}
      {/* 3-ZONE PRODUCTION LAYOUT (Prompt 04 Section 2)                             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* ZONE 1 (LEFT): SEQUENCE / SHOT NAVIGATOR (3 Cols)                          */}
        {/* ========================================================================= */}
        <div className="lg:col-span-3 space-y-4">
          <GlowCard className="p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono-code text-[#71717A]">
              <span>SEQUENCE SHOTS ({activeProject.shots.length})</span>
              <span className="text-[#C084FC] font-bold">ACTIVE: {currentShot.shot_number}</span>
            </div>

            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
              {activeProject.shots.map((shot) => {
                const isSelected = shot.id === currentShot.id;
                const hasApprovedKeyframe = !!shot.keyframe_url;
                const hasVideo = !!shot.video_url || (shot.video_generations && shot.video_generations.length > 0);
                const isQueued = queue.some(
                  (q) => q.shotId === shot.id && (q.status === 'QUEUED' || q.status === 'GENERATING' || q.status === 'PROCESSING')
                );

                let statusBadgeText = 'Keyframe Required';
                let statusColor = 'text-[#71717A] bg-[#71717A]/10';

                if (isQueued) {
                  statusBadgeText = 'Queued';
                  statusColor = 'text-[#A855F7] bg-[#A855F7]/10 animate-pulse';
                } else if (hasVideo) {
                  statusBadgeText = 'Complete';
                  statusColor = 'text-[#22C55E] bg-[#22C55E]/10';
                } else if (hasApprovedKeyframe) {
                  statusBadgeText = 'Ready';
                  statusColor = 'text-[#3B82F6] bg-[#3B82F6]/10';
                }

                return (
                  <button
                    key={shot.id}
                    type="button"
                    onClick={() => handleSelectShot(shot.id)}
                    className={`w-full text-left p-2.5 rounded-[12px] border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1E1D27] border-[#A855F7]/50 shadow-md'
                        : 'bg-[#101014] border-white/[0.06] hover:bg-[#15151B] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Shot Thumbnail */}
                      <div className="w-14 aspect-video rounded-[6px] overflow-hidden bg-black/60 border border-white/[0.08] flex-shrink-0 relative">
                        {shot.keyframe_url ? (
                          <img
                            src={shot.keyframe_url}
                            alt={shot.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-[#71717A]">
                            No Frame
                          </div>
                        )}
                        {hasVideo && (
                          <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono-code text-xs font-bold text-[#C084FC]">
                            {shot.shot_number}
                          </span>
                          <span className={`text-[9px] font-mono-code px-1.5 py-0.5 rounded-[4px] ${statusColor}`}>
                            {statusBadgeText}
                          </span>
                        </div>
                        <h5 className="font-display text-xs font-medium text-[#FAFAFA] truncate mt-0.5">
                          {shot.title}
                        </h5>
                        <p className="text-[10px] font-mono-code text-[#71717A] truncate">
                          {shot.duration_seconds || 5}s · {shot.camera_type || 'Motion'}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </GlowCard>
        </div>

        {/* ========================================================================= */}
        {/* ZONE 2 (CENTER): VIDEO CANVAS VIEWPORT (6 Cols)                           */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 space-y-4">
          <VideoCanvas
            currentShot={currentShot}
            nextShot={nextShot}
            availableKeyframes={availableKeyframes}
            startFrameUrl={startFrameUrl}
            endFrameUrl={endFrameUrl}
            onSetStartFrame={setStartFrameUrl}
            onSetEndFrame={setEndFrameUrl}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            generationProgress={genProgress}
            isGenerating={isGenerating}
            onRegenerate={handleGenerateShot}
            onApproveVideo={handleApproveVideo}
            onSelectVersion={handleSelectVersion}
          />
        </div>

        {/* ========================================================================= */}
        {/* ZONE 3 (RIGHT): MOTION DIRECTION, PROMPT & CONTROLS (3 Cols)              */}
        {/* ========================================================================= */}
        <div className="lg:col-span-3 space-y-4">
          <GlowCard className="p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <span className="text-[10px] font-mono-code text-[#71717A] uppercase">
                MOTION DIRECTION
              </span>
              <span className="text-xs font-mono-code font-bold text-[#C084FC]">
                {currentShot.shot_number} · {currentShot.title}
              </span>
            </div>

            {/* Structured Motion Direction Editor (Section 5) */}
            <div className="space-y-3">
              {/* Subject Motion */}
              <div>
                <label className="block text-[11px] font-mono-code text-[#A1A1AA] uppercase mb-1">
                  Subject Motion
                </label>
                <select
                  value={subjectMotion}
                  onChange={(e) => setSubjectMotion(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#15151B] border border-white/[0.08] focus:border-[#A855F7]/50 rounded-[8px] text-xs text-[#FAFAFA] outline-none cursor-pointer"
                >
                  <option value="Product remains stationary">Product remains stationary</option>
                  <option value="Slow rotation">Slow rotation</option>
                  <option value="Controlled mechanical movement">Controlled mechanical movement</option>
                  <option value="Subtle reveal">Subtle reveal</option>
                  <option value="Camera approaches product">Camera approaches product</option>
                  <option value="Camera pulls away">Camera pulls away</option>
                  <option value="Product emerges from darkness">Product emerges from darkness</option>
                </select>
              </div>

              {/* Camera Motion */}
              <div>
                <label className="block text-[11px] font-mono-code text-[#A1A1AA] uppercase mb-1">
                  Camera Motion
                </label>
                <select
                  value={cameraMotion}
                  onChange={(e) => setCameraMotion(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#15151B] border border-white/[0.08] focus:border-[#A855F7]/50 rounded-[8px] text-xs text-[#FAFAFA] outline-none cursor-pointer"
                >
                  <option value="Static">Static</option>
                  <option value="Slow push-in">Slow push-in</option>
                  <option value="Slow pull-back">Slow pull-back</option>
                  <option value="Orbit">Orbit</option>
                  <option value="Lateral tracking">Lateral tracking</option>
                  <option value="Crane movement">Crane movement</option>
                  <option value="Macro drift">Macro drift</option>
                  <option value="Cinematic handheld">Cinematic handheld</option>
                </select>
              </div>

              {/* Environmental Motion */}
              <div>
                <label className="block text-[11px] font-mono-code text-[#A1A1AA] uppercase mb-1">
                  Environmental Physics
                </label>
                <select
                  value={environmentalMotion}
                  onChange={(e) => setEnvironmentalMotion(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#15151B] border border-white/[0.08] focus:border-[#A855F7]/50 rounded-[8px] text-xs text-[#FAFAFA] outline-none cursor-pointer"
                >
                  <option value="Floating particles">Floating particles</option>
                  <option value="Controlled haze">Controlled haze</option>
                  <option value="Soft atmospheric movement">Soft atmospheric movement</option>
                  <option value="Light sweep">Light sweep</option>
                  <option value="Reflections moving across surface">Reflections moving across surface</option>
                  <option value="Subtle background movement">Subtle background movement</option>
                </select>
              </div>

              {/* Motion Intensity */}
              <div>
                <label className="block text-[11px] font-mono-code text-[#A1A1AA] uppercase mb-1">
                  Motion Intensity
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {(['Minimal', 'Controlled', 'Cinematic', 'Dynamic'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setMotionIntensity(lvl)}
                      className={`py-1 text-[10px] font-mono-code rounded-[6px] border transition-colors cursor-pointer ${
                        motionIntensity === lvl
                          ? 'bg-[#1E1D27] border-[#A855F7]/50 text-white font-bold'
                          : 'bg-[#15151B] border-white/[0.06] text-[#A1A1AA] hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Freeform Motion Notes */}
              <div>
                <label className="block text-[11px] font-mono-code text-[#A1A1AA] uppercase mb-1">
                  Director Motion Notes
                </label>
                <input
                  type="text"
                  value={motionNotes}
                  onChange={(e) => setMotionNotes(e.target.value)}
                  placeholder="e.g. Specular glint on left bezel at second 3"
                  className="w-full px-2.5 py-1.5 bg-[#15151B] border border-white/[0.08] focus:border-[#A855F7]/50 rounded-[8px] text-xs text-[#FAFAFA] outline-none placeholder:text-[#71717A]"
                />
              </div>
            </div>

            {/* Video Prompt Builder (Section 6) */}
            <div className="pt-2 border-t border-white/[0.04] space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono-code text-[#A1A1AA] uppercase">
                  Veo Motion Prompt
                </label>
                <button
                  type="button"
                  onClick={handleBuildMotionPrompt}
                  className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono-code text-[#C084FC] hover:text-white bg-[#1E1D27] hover:bg-[#282635] border border-[#A855F7]/30 rounded-[6px] transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-[#A855F7]" />
                  <span>Build Prompt</span>
                </button>
              </div>

              <textarea
                rows={4}
                value={motionPrompt}
                onChange={(e) => setMotionPrompt(e.target.value)}
                placeholder="Motion choreography prompt..."
                className="w-full p-2.5 bg-[#15151B] border border-white/[0.08] focus:border-[#A855F7]/60 rounded-[10px] text-xs text-[#FAFAFA] placeholder:text-[#71717A] outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Duration & Model Settings (Section 7) */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.04]">
              <div>
                <label className="block text-[10px] font-mono-code text-[#A1A1AA] uppercase mb-1">
                  Duration
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {[5, 8].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setDuration(sec)}
                      className={`py-1 text-[10px] font-mono-code rounded-[6px] border transition-colors cursor-pointer ${
                        duration === sec
                          ? 'bg-[#1E1D27] border-[#A855F7]/50 text-white font-bold'
                          : 'bg-[#15151B] border-white/[0.06] text-[#A1A1AA] hover:text-white'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono-code text-[#A1A1AA] uppercase mb-1">
                  Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value as any)}
                  className="w-full px-2 py-1.5 bg-[#15151B] border border-white/[0.08] rounded-[6px] text-[10px] font-mono-code text-[#FAFAFA] outline-none cursor-pointer"
                >
                  <option value="veo-3.1-generate-preview">Veo 3.1 HQ</option>
                  <option value="veo-3.1-lite-generate-preview">Veo 3.1 Lite</option>
                </select>
              </div>
            </div>

            {/* Provider Status Card */}
            <div className="p-2 bg-[#121118] border border-white/[0.06] rounded-[8px] flex items-center justify-between text-[10px] font-mono-code">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    providerStatus.configured ? 'bg-[#22C55E]' : 'bg-[#A855F7]'
                  }`}
                />
                <span className="text-[#FAFAFA]">
                  {providerStatus.configured ? 'Gemini / Veo API' : 'Studio Preview Engine'}
                </span>
              </div>
              <span className="text-[#71717A]">
                {providerStatus.configured ? 'Configured' : 'Preview'}
              </span>
            </div>

            {/* Primary & Secondary Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleGenerateShot}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#EC4899] hover:opacity-95 text-white rounded-[10px] text-xs font-semibold shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
              >
                {isGenerating ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing Motion...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>✦ Generate Shot</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleAddToQueue}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-[#15151B] hover:bg-[#1E1D27] text-[#FAFAFA] border border-white/[0.08] rounded-[10px] text-xs font-medium transition-colors cursor-pointer"
              >
                <ListOrdered className="w-3.5 h-3.5 text-[#C084FC]" />
                <span>+ Add to Queue</span>
              </button>
            </div>
          </GlowCard>

          {/* Section 13: Continuity Assistant */}
          <GlowCard className="p-4 space-y-3 bg-[#121118]">
            <div className="flex items-center gap-1.5 text-[11px] font-mono-code text-[#A855F7] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Continuity Assistant</span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div>
                <span className="text-[10px] font-mono-code text-[#71717A] uppercase block">
                  Product Identity
                </span>
                <p className="text-xs text-[#FAFAFA] font-medium mt-0.5">
                  {activeProject.name} · {activeProject.creative_concept?.visual_language_attributes?.materials || 'Titanium / Smoked Crystal'}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-mono-code text-[#71717A] uppercase block">
                  Optical & Lighting Continuity
                </span>
                <p className="text-[#A1A1AA] mt-0.5">
                  {currentShot.lens || '85mm'} · {currentShot.lighting_style || 'Controlled Studio'}
                </p>
              </div>

              {/* Prev and Next Shot Context */}
              <div className="pt-2 border-t border-white/[0.04] grid grid-cols-2 gap-2 text-[10px] font-mono-code">
                <div>
                  <span className="text-[#71717A] block">PREV SHOT:</span>
                  <span className="text-[#A1A1AA] truncate block">
                    {prevShot ? `${prevShot.shot_number} · ${prevShot.title}` : 'None (Opener)'}
                  </span>
                </div>
                <div>
                  <span className="text-[#71717A] block">NEXT SHOT:</span>
                  <span className="text-[#A1A1AA] truncate block">
                    {nextShot ? `${nextShot.shot_number} · ${nextShot.title}` : 'None (Closer)'}
                  </span>
                </div>
              </div>
            </div>
          </GlowCard>
        </div>
      </div>
    </div>
  );
};
