import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { useRouter } from '../context/RouterContext';
import { ImageCanvas } from '../components/workspace/ImageCanvas';
import { PromptEditor } from '../components/workspace/PromptEditor';
import { AssetPickerModal } from '../components/workspace/AssetPickerModal';
import { GlowCard } from '../components/common/GlowCard';
import { ProgressIndicator } from '../components/common/ProgressIndicator';
import {
  imageGenerationService,
  buildCinematicPrompt
} from '../services/imageGenerationService';
import { storageService } from '../services/storageService';
import { Asset, Shot, KeyframeGeneration, AspectRatio } from '../types';
import {
  Sparkles,
  Camera,
  SunMedium,
  Layers,
  ArrowRight,
  Maximize2,
  CheckCircle2,
  RefreshCw,
  Compass,
  Film,
  Plus,
  Trash2,
  X,
  Image as ImageIcon,
  Sliders,
  Check,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

export const KeyframePage: React.FC = () => {
  const {
    activeProject,
    selectedShotId,
    setSelectedShotId,
    updateShot,
    addShot,
    showToast
  } = useProject();
  const { navigate } = useRouter();

  if (!activeProject) return null;

  const currentShot =
    activeProject.shots.find((s) => s.id === selectedShotId) || activeProject.shots[0];

  if (!currentShot || activeProject.shots.length === 0) {
    return (
      <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
        <div className="pb-4 border-b border-white/[0.06] flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono-code text-[#A855F7] uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>KEYFRAME LAB · IMAGE GENERATION ENGINE</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#FAFAFA]">
              {activeProject.name} — Keyframe Synthesis
            </h1>
            <p className="text-xs text-[#A1A1AA] mt-1 max-w-2xl leading-relaxed">
              Generate high-resolution visual keyframes for each shot.
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

        <ProgressIndicator project={activeProject} currentStep="keyframes" />

        <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
          <GlowCard className="p-10 text-center space-y-6 bg-[#101014] border-white/[0.08] shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-[#181722] border border-[#A855F7]/30 flex items-center justify-center text-[#C084FC] mx-auto shadow-[0_0_24px_rgba(139,92,246,0.2)]">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#FAFAFA]">
                No Shots in Sequence
              </h2>
              <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-md mx-auto leading-relaxed">
                Keyframe Lab requires sequence shots to synthesize visual keyframes. Add your first shot to start generating commercial stills with the prompt engine.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const newShot = addShot({
                    title: 'Hero Reveal',
                    purpose: 'Establish product presence and material finishes.'
                  });
                  setSelectedShotId(newShot.id);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#EC4899] text-white rounded-[12px] text-xs font-semibold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:opacity-95 transition-opacity cursor-pointer"
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

  const [prompt, setPrompt] = useState(currentShot?.prompt || '');
  const [camera, setCamera] = useState(currentShot?.focal_length || '85mm Macro');
  const [lighting, setLighting] = useState(currentShot?.lighting_style || 'Soft Studio');
  const [environment, setEnvironment] = useState(
    currentShot?.environment || 'Dark Architecture'
  );
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [quality, setQuality] = useState<'standard' | 'hd'>('standard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectAssets, setProjectAssets] = useState<Asset[]>([]);
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false);
  const [activeGenerationId, setActiveGenerationId] = useState<string | undefined>(
    currentShot?.selected_version_id
  );
  const [providerStatus, setProviderStatus] = useState<{
    configured: boolean;
    model: string;
    message: string;
  }>({
    configured: false,
    model: 'gpt-image-1',
    message: 'Checking provider status...'
  });

  // Keep state in sync whenever currentShot changes (Prompt 03: Handoff & Continuity)
  useEffect(() => {
    if (currentShot) {
      setPrompt(currentShot.prompt || '');
      setCamera(currentShot.focal_length || currentShot.lens || '85mm Macro');
      setLighting(currentShot.lighting_style || 'Controlled Directional Highlight');
      setEnvironment(currentShot.environment || 'Dark Studio');
      setActiveGenerationId(currentShot.selected_version_id);
    }
  }, [currentShot?.id]);

  useEffect(() => {
    const loadAssets = async () => {
      const list = await storageService.listAssets(activeProject.id);
      setProjectAssets(list);
    };
    loadAssets();

    imageGenerationService.checkProviderStatus().then((status) => {
      setProviderStatus(status);
    });
  }, [activeProject.id]);

  const handleSelectShot = (shotId: string) => {
    setSelectedShotId(shotId);
  };

  // Auto-compose prompt using deterministic smart prompt builder
  const handleAutoComposePrompt = () => {
    if (!currentShot) return;
    const composed = buildCinematicPrompt(currentShot, activeProject);
    setPrompt(composed);
    showToast('Prompt composed from creative brief and shot purpose', 'info');
  };

  const handleGenerateKeyframe = async () => {
    if (!currentShot) return;
    setIsGenerating(true);

    try {
      const shotAttachedIds = [
        ...(currentShot.product_reference_ids || []),
        ...(currentShot.visual_reference_ids || [])
      ];

      const shotRefAssets = projectAssets.filter((a) =>
        shotAttachedIds.includes(a.id)
      );

      const references = shotRefAssets.map((a) => ({
        asset_id: a.id,
        type: (a.category === 'Product' ? 'product' : 'visual') as 'product' | 'visual',
        url: a.file_url,
        name: a.name,
        category: a.category
      }));

      const activePrompt = prompt.trim() || buildCinematicPrompt(currentShot, activeProject);

      const result = await imageGenerationService.generateKeyframe({
        shot_id: currentShot.id,
        project_id: activeProject.id,
        prompt: activePrompt,
        aspect_ratio: aspectRatio,
        quality,
        references,
        camera,
        lighting,
        environment
      });

      if (result.success && result.image_url) {
        const genId = `gen-${Date.now()}`;
        const newGeneration: KeyframeGeneration = {
          id: genId,
          project_id: activeProject.id,
          shot_id: currentShot.id,
          version_number: (currentShot.generations?.length || 0) + 1,
          prompt: result.revised_prompt || activePrompt,
          references,
          model: result.model,
          aspect_ratio: aspectRatio,
          quality,
          status: 'completed',
          image_url: result.image_url,
          is_approved: false,
          created_at: new Date().toISOString(),
          is_demo: result.is_demo
        };

        const existingGens = currentShot.generations || [];
        // If shot already had an initial keyframe with no record, capture it as v1
        const updatedGenerations =
          existingGens.length === 0 && currentShot.keyframe_url
            ? [
                {
                  id: `gen-init-${currentShot.id}`,
                  project_id: activeProject.id,
                  shot_id: currentShot.id,
                  version_number: 1,
                  prompt: currentShot.prompt,
                  references: [],
                  model: 'Initial Studio Setup',
                  aspect_ratio: '16:9' as const,
                  status: 'completed' as const,
                  image_url: currentShot.keyframe_url,
                  is_approved: currentShot.status === 'KEYFRAME_READY',
                  created_at: new Date().toISOString()
                },
                { ...newGeneration, version_number: 2 }
              ]
            : [...existingGens, newGeneration];

        const updatedShot: Shot = {
          ...currentShot,
          prompt: activePrompt,
          focal_length: camera,
          lighting_style: lighting,
          environment,
          keyframe_url: result.image_url,
          generations: updatedGenerations,
          selected_version_id: newGeneration.id
        };

        setActiveGenerationId(newGeneration.id);
        updateShot(updatedShot);

        if (result.is_demo) {
          showToast(`Keyframe synthesized via Studio Preview Engine`, 'info');
        } else {
          showToast(`Keyframe synthesized with OpenAI gpt-image-1`, 'success');
        }
      } else {
        showToast(result.message || 'Keyframe generation error', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Keyframe generation failed', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApproveKeyframe = () => {
    if (!currentShot || !currentShot.keyframe_url) return;

    const currentGens = currentShot.generations || [];
    const updatedGens = currentGens.map((g) => ({
      ...g,
      is_approved: g.image_url === currentShot.keyframe_url
    }));

    const updatedShot: Shot = {
      ...currentShot,
      status: 'KEYFRAME_READY',
      approved_keyframe_id: activeGenerationId || currentShot.selected_version_id || 'approved-frame',
      generations: updatedGens
    };

    updateShot(updatedShot);
    showToast(`Approved ${currentShot.shot_number} keyframe as visual source of truth`, 'success');
  };

  const handleSelectGeneration = (generation: KeyframeGeneration) => {
    if (!currentShot) return;
    setActiveGenerationId(generation.id);
    const updatedShot: Shot = {
      ...currentShot,
      keyframe_url: generation.image_url,
      selected_version_id: generation.id
    };
    updateShot(updatedShot);
    showToast(`Active variant switched to V${generation.version_number}`, 'info');
  };

  const handleSaveFrame = () => {
    if (!currentShot) return;
    updateShot({
      ...currentShot,
      prompt,
      focal_length: camera,
      lighting_style: lighting,
      environment
    });
    showToast(`Saved state for ${currentShot.shot_number}`, 'success');
  };

  // References management
  const shotAttachedAssetIds = [
    ...(currentShot?.product_reference_ids || []),
    ...(currentShot?.visual_reference_ids || [])
  ];

  const shotReferences = projectAssets.filter((a) =>
    shotAttachedAssetIds.includes(a.id)
  );

  const projectVaultReferences = projectAssets.filter(
    (a) => !shotAttachedAssetIds.includes(a.id)
  );

  const handleConfirmAssetPicker = (selectedIds: string[]) => {
    if (!currentShot) return;
    const updatedShot: Shot = {
      ...currentShot,
      product_reference_ids: selectedIds
    };
    updateShot(updatedShot);
    showToast(`Updated reference plates for ${currentShot.shot_number}`, 'success');
  };

  const handleRemoveShotReference = (assetId: string) => {
    if (!currentShot) return;
    const updatedShot: Shot = {
      ...currentShot,
      product_reference_ids: (currentShot.product_reference_ids || []).filter(
        (id) => id !== assetId
      ),
      visual_reference_ids: (currentShot.visual_reference_ids || []).filter(
        (id) => id !== assetId
      )
    };
    updateShot(updatedShot);
    showToast('Reference detached from shot', 'info');
  };

  const handleAddShotReferenceFromProject = (assetId: string) => {
    if (!currentShot) return;
    const currentList = currentShot.product_reference_ids || [];
    if (!currentList.includes(assetId)) {
      const updatedShot: Shot = {
        ...currentShot,
        product_reference_ids: [...currentList, assetId]
      };
      updateShot(updatedShot);
      showToast('Reference attached to shot', 'success');
    }
  };

  const cameraPresets = [
    '85mm Macro T2.9',
    '50mm Prime Master',
    '35mm Cine Anamorphic',
    '100mm Probe Lens',
    '24mm Ultra Wide',
    '40mm Anamorphic 2x'
  ];

  const lightingPresets = [
    'Controlled Directional Highlight',
    'Soft Studio Directional',
    'Anamorphic Edge Flare',
    'Subtle Rim Illumination',
    'Natural Dusk Grazing Light',
    'Dual Spectral Violet Rim'
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="pb-4 border-b border-white/[0.06] flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono-code text-[#A855F7] uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>KEYFRAME LAB · IMAGE GENERATION ENGINE</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#FAFAFA]">
            {activeProject.name} — Keyframe Synthesis
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1 max-w-2xl leading-relaxed">
            Generate high-resolution visual keyframes for each shot. The approved keyframe establishes the definitive visual source of truth for downstream video generation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/projects/${activeProject.id}/storyboard`)}
            className="px-3.5 py-2 text-xs font-medium text-[#A1A1AA] hover:text-[#FAFAFA] bg-[#101014] hover:bg-[#15151B] border border-white/[0.06] rounded-[10px] transition-colors cursor-pointer"
          >
            ← Storyboard Sequence
          </button>
          <button
            type="button"
            onClick={() => navigate(`/projects/${activeProject.id}/video`)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#15151B] hover:bg-[#1E1D27] text-white rounded-[10px] text-xs font-medium border border-white/[0.08] transition-colors cursor-pointer"
          >
            <span>Proceed to Video Lab</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C084FC]" />
          </button>
        </div>
      </div>

      {/* Production Pipeline Indicator */}
      <ProgressIndicator project={activeProject} currentStep="keyframes" />

      {/* Main 3-Zone Production Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* ZONE 1 (LEFT): REFERENCE VAULT & SHOT CONTEXT (3 Cols)                     */}
        {/* ========================================================================= */}
        <div className="lg:col-span-3 space-y-4">
          {/* 1A. Shot Sequence Selector */}
          <GlowCard className="p-4 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-mono-code text-[#71717A] uppercase tracking-wider">
              <span>Sequence Beat:</span>
              <span className="text-[#C084FC] font-bold">{currentShot?.shot_number}</span>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {activeProject.shots.map((s) => {
                const isSelected = s.id === currentShot?.id;
                const hasKeyframe = !!s.keyframe_url;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectShot(s.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-[10px] text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1E1D27] border border-[#A855F7]/40 text-white shadow-sm'
                        : 'bg-[#101014] text-[#A1A1AA] hover:bg-[#15151B] hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono-code text-xs font-bold text-[#C084FC]">
                        {s.shot_number}
                      </span>
                      <span className="truncate">{s.title}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {hasKeyframe && (
                        <div className="w-4 h-3 rounded-[3px] overflow-hidden border border-white/20">
                          <img
                            src={s.keyframe_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <span
                        className={`w-2 h-2 rounded-full ${
                          s.status === 'KEYFRAME_READY' || s.status === 'completed'
                            ? 'bg-[#22C55E]'
                            : s.status === 'VIDEO_READY'
                            ? 'bg-[#3B82F6]'
                            : 'bg-[#71717A]'
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </GlowCard>

          {/* 1B. Creative Context for Active Shot */}
          {currentShot && (
            <GlowCard className="p-4 space-y-3 bg-[#121118]">
              <div className="flex items-center gap-1.5 text-[11px] font-mono-code text-[#A855F7] uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5" />
                <span>Creative Context ({currentShot.shot_number})</span>
              </div>

              {currentShot.purpose && (
                <div>
                  <span className="text-[10px] font-mono-code text-[#71717A] uppercase block">
                    Purpose
                  </span>
                  <p className="text-xs text-[#FAFAFA] font-medium mt-0.5 leading-relaxed">
                    {currentShot.purpose}
                  </p>
                </div>
              )}

              {currentShot.visual_description && (
                <div>
                  <span className="text-[10px] font-mono-code text-[#71717A] uppercase block">
                    Visual Intent
                  </span>
                  <p className="text-xs text-[#A1A1AA] mt-0.5 leading-relaxed">
                    {currentShot.visual_description}
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-white/[0.04] grid grid-cols-2 gap-2 text-[10px] font-mono-code text-[#71717A]">
                <div>
                  <span className="text-[#71717A] block">OPTICS:</span>
                  <span className="text-[#A1A1AA] truncate block">
                    {currentShot.lens || currentShot.focal_length || '85mm'}
                  </span>
                </div>
                <div>
                  <span className="text-[#71717A] block">DURATION:</span>
                  <span className="text-[#A1A1AA] block">{currentShot.duration_seconds}s</span>
                </div>
              </div>
            </GlowCard>
          )}

          {/* 1C. Reference Vault (Prompt 03 Section 3) */}
          <GlowCard className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-mono-code text-[#71717A] uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5 text-[#A855F7]" />
                <span>Reference Vault</span>
              </div>
              <button
                type="button"
                onClick={() => navigate('/assets')}
                className="text-[10px] text-[#C084FC] hover:underline"
              >
                Open Vault →
              </button>
            </div>

            {/* SHOT REFERENCES */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono-code text-[#A1A1AA] uppercase tracking-wider">
                  Shot References ({shotReferences.length})
                </span>
                <button
                  type="button"
                  onClick={() => setIsAssetPickerOpen(true)}
                  className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono-code text-[#C084FC] hover:text-white bg-[#1A1924] hover:bg-[#252333] border border-[#A855F7]/30 rounded-[6px] transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Reference</span>
                </button>
              </div>

              {shotReferences.length === 0 ? (
                <div className="p-3 bg-[#0D0D10] border border-dashed border-white/[0.08] rounded-[10px] text-center">
                  <p className="text-[11px] text-[#71717A]">
                    No references attached to {currentShot?.shot_number}.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsAssetPickerOpen(true)}
                    className="mt-1.5 text-[10px] text-[#C084FC] hover:underline cursor-pointer"
                  >
                    + Attach from Project Vault
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {shotReferences.map((ref) => (
                    <div
                      key={ref.id}
                      className="group flex items-center justify-between p-1.5 bg-[#15151B] border border-white/[0.06] rounded-[8px] hover:border-white/[0.14] transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-[6px] overflow-hidden bg-black/60 flex-shrink-0 border border-white/[0.08]">
                          <img
                            src={ref.file_url}
                            alt={ref.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-[#FAFAFA] truncate font-medium">
                            {ref.name}
                          </p>
                          <span className="text-[9px] font-mono-code text-[#71717A]">
                            {ref.category}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveShotReference(ref.id)}
                        className="p-1 text-[#71717A] hover:text-[#EF4444] transition-colors cursor-pointer"
                        title="Remove reference"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PROJECT REFERENCES */}
            <div className="space-y-2 pt-2 border-t border-white/[0.04]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono-code text-[#71717A] uppercase tracking-wider">
                  Project References ({projectVaultReferences.length})
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {projectVaultReferences.slice(0, 4).map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => handleAddShotReferenceFromProject(asset.id)}
                    className="group relative aspect-video rounded-[8px] overflow-hidden border border-white/[0.08] bg-[#0E0E12] cursor-pointer hover:border-[#A855F7]/60 transition-all"
                    title={`Click to attach ${asset.name} to this shot`}
                  >
                    <img
                      src={asset.file_url}
                      alt={asset.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                      <span className="text-[9px] font-mono-code text-white truncate max-w-full">
                        + {asset.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlowCard>
        </div>

        {/* ========================================================================= */}
        {/* ZONE 2 (CENTER): KEYFRAME CANVAS & REVIEW WORKSPACE (6 Cols)               */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 h-full">
          {currentShot && (
            <ImageCanvas
              shot={currentShot}
              isGenerating={isGenerating}
              onRegenerate={handleGenerateKeyframe}
              onSave={handleSaveFrame}
              onApprove={handleApproveKeyframe}
              isApproved={
                currentShot.status === 'KEYFRAME_READY' ||
                currentShot.status === 'VIDEO_READY' ||
                currentShot.status === 'completed'
              }
              generations={currentShot.generations || []}
              activeGenerationId={activeGenerationId}
              onSelectGeneration={handleSelectGeneration}
              onPushToVideo={() => navigate(`/projects/${activeProject.id}/video`)}
            />
          )}
        </div>

        {/* ========================================================================= */}
        {/* ZONE 3 (RIGHT): GENERATION ENGINE CONTROLS (3 Cols)                       */}
        {/* ========================================================================= */}
        <div className="lg:col-span-3 space-y-4">
          <GlowCard className="p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div>
                <span className="text-[10px] font-mono-code text-[#71717A] uppercase block">
                  ACTIVE TARGET
                </span>
                <span className="text-xs font-display font-bold text-[#FAFAFA]">
                  {currentShot?.title || 'SHOT'}
                </span>
              </div>
              <span className="text-xs font-mono-code font-bold text-[#C084FC] px-2 py-0.5 rounded-[6px] bg-[#1E1D27] border border-[#A855F7]/30">
                {currentShot?.shot_number || 'K01'}
              </span>
            </div>

            {/* Prompt Editor with Auto-Compose Smart Builder */}
            <PromptEditor
              value={prompt}
              onChange={setPrompt}
              onBuildCinematicPrompt={handleAutoComposePrompt}
              isGenerating={isGenerating}
            />

            {/* Camera Optics Preset */}
            <div>
              <label className="block text-xs font-mono-code text-[#A1A1AA] uppercase mb-1.5">
                Camera Optics
              </label>
              <select
                value={camera}
                onChange={(e) => setCamera(e.target.value)}
                className="w-full px-3 py-2 bg-[#15151B] border border-white/[0.08] focus:border-[#A855F7]/50 rounded-[10px] text-xs text-[#FAFAFA] outline-none cursor-pointer"
              >
                {cameraPresets.map((preset) => (
                  <option key={preset} value={preset}>
                    {preset}
                  </option>
                ))}
              </select>
            </div>

            {/* Lighting Style Preset */}
            <div>
              <label className="block text-xs font-mono-code text-[#A1A1AA] uppercase mb-1.5">
                Lighting Atmosphere
              </label>
              <select
                value={lighting}
                onChange={(e) => setLighting(e.target.value)}
                className="w-full px-3 py-2 bg-[#15151B] border border-white/[0.08] focus:border-[#A855F7]/50 rounded-[10px] text-xs text-[#FAFAFA] outline-none cursor-pointer"
              >
                {lightingPresets.map((preset) => (
                  <option key={preset} value={preset}>
                    {preset}
                  </option>
                ))}
              </select>
            </div>

            {/* Environment Architecture */}
            <div>
              <label className="block text-xs font-mono-code text-[#A1A1AA] uppercase mb-1.5">
                Environment Architecture
              </label>
              <input
                type="text"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                placeholder="e.g. Dark Studio, Brutalist Concrete"
                className="w-full px-3 py-2 bg-[#15151B] border border-white/[0.08] focus:border-[#A855F7]/50 rounded-[10px] text-xs text-[#FAFAFA] outline-none"
              />
            </div>

            {/* Aspect Ratio & Quality Settings */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono-code text-[#A1A1AA] uppercase mb-1.5">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {(['16:9', '9:16', '1:1'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={`py-1 text-[10px] font-mono-code rounded-[6px] border transition-colors cursor-pointer ${
                        aspectRatio === ratio
                          ? 'bg-[#1E1D27] border-[#A855F7]/50 text-white font-bold'
                          : 'bg-[#15151B] border-white/[0.06] text-[#A1A1AA] hover:text-white'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono-code text-[#A1A1AA] uppercase mb-1.5">
                  Render Quality
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {(['standard', 'hd'] as const).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuality(q)}
                      className={`py-1 text-[10px] font-mono-code uppercase rounded-[6px] border transition-colors cursor-pointer ${
                        quality === q
                          ? 'bg-[#1E1D27] border-[#A855F7]/50 text-white font-bold'
                          : 'bg-[#15151B] border-white/[0.06] text-[#A1A1AA] hover:text-white'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Provider Status Badge */}
            <div className="p-2.5 bg-[#121118] border border-white/[0.06] rounded-[10px] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    providerStatus.configured ? 'bg-[#22C55E]' : 'bg-[#A855F7]'
                  }`}
                />
                <span className="text-[10px] font-mono-code text-[#FAFAFA]">
                  {providerStatus.configured
                    ? `OpenAI (${providerStatus.model || 'gpt-image-1'}) Active`
                    : 'Studio Preview Engine'}
                </span>
              </div>
              <span className="text-[9px] font-mono-code text-[#71717A]">
                {providerStatus.configured ? 'Live API' : 'Direct Render'}
              </span>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGenerateKeyframe}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#EC4899] hover:opacity-95 text-white rounded-[12px] text-xs font-semibold shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Keyframe...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>✦ Generate Keyframe</span>
                  </>
                )}
              </button>

              <div className="text-[10px] font-mono-code text-[#71717A] text-center mt-2">
                {currentShot?.keyframe_url
                  ? 'Active Keyframe established'
                  : 'Synthesizing will create shot keyframe'}
              </div>
            </div>
          </GlowCard>
        </div>
      </div>

      {/* Asset Picker Modal for Shot Reference Attachment */}
      <AssetPickerModal
        isOpen={isAssetPickerOpen}
        onClose={() => setIsAssetPickerOpen(false)}
        selectedAssetIds={shotAttachedAssetIds}
        onConfirm={handleConfirmAssetPicker}
        projectId={activeProject.id}
      />
    </div>
  );
};
