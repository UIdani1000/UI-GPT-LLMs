import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { useRouter } from '../context/RouterContext';
import { GlowCard } from '../components/common/GlowCard';
import { ProgressIndicator } from '../components/common/ProgressIndicator';
import { AssetPickerModal } from '../components/workspace/AssetPickerModal';
import { creativeDirectorService } from '../services/creativeDirectorService';
import { storageService } from '../services/storageService';
import { Asset, CreativeConcept } from '../types';
import {
  Compass,
  Sparkles,
  Layers,
  ArrowRight,
  Check,
  Plus,
  X,
  Camera,
  SunMedium,
  Box,
  Palette,
  Film,
  ShieldCheck,
  Clock,
  Eye
} from 'lucide-react';

const OBJECTIVES = [
  'Product Launch',
  'Brand Film',
  'Product Advertisement',
  'Social Campaign',
  'Portfolio Film',
  'Custom'
];

const MOODS = [
  'Minimal',
  'Cinematic',
  'Luxury',
  'Futuristic',
  'Architectural',
  'Warm',
  'Dramatic',
  'Editorial',
  'Technical'
];

const ENVIRONMENTS = [
  'Dark Studio',
  'Modern Interior',
  'Architecture',
  'Outdoor',
  'Abstract',
  'Custom'
];

const CAMERA_LANGUAGES = [
  'Slow Push',
  'Dolly',
  'Orbit',
  'Macro',
  'Tracking',
  'Static Hero',
  'Handheld',
  'Custom'
];

export const BrainstormPage: React.FC = () => {
  const { activeProject, updateActiveProject, showToast } = useProject();
  const { navigate } = useRouter();

  if (!activeProject) return null;

  // Form states initialized from project's creative_brief
  const brief = activeProject.creative_brief;
  const [productName, setProductName] = useState(brief.product_name || activeProject.name);
  const [description, setDescription] = useState(
    brief.product_description ||
      'A premium cinematic product film introducing NOVAIR ONE, an uncompromising spatial acoustic instrument crafted from bead-blasted aerospace titanium, smoked optical crystal, and custom diamond-cut haptic knurling.'
  );
  const [objective, setObjective] = useState(brief.objective || 'Product Launch');
  const [selectedMoods, setSelectedMoods] = useState<string[]>(
    brief.visual_moods || ['Minimal', 'Cinematic', 'Luxury', 'Architectural']
  );
  const [environment, setEnvironment] = useState(brief.environment || 'Dark Studio');
  const [customEnv, setCustomEnv] = useState('');
  const [cameraLanguage, setCameraLanguage] = useState(brief.camera_language || 'Slow Push');
  const [customCamera, setCustomCamera] = useState('');
  const [creativeNotes, setCreativeNotes] = useState(brief.creative_notes || '');

  // Reference Assets
  const [selectedRefIds, setSelectedRefIds] = useState<string[]>(
    brief.reference_asset_ids || activeProject.pinned_asset_ids || []
  );
  const [referenceAssets, setReferenceAssets] = useState<Asset[]>([]);
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [concept, setConcept] = useState<CreativeConcept>(activeProject.creative_concept);

  // Load referenced assets
  useEffect(() => {
    const loadRefs = async () => {
      const allAssets = await storageService.listAssets(activeProject.id);
      const matched = allAssets.filter((a) => selectedRefIds.includes(a.id));
      setReferenceAssets(matched);
    };
    loadRefs();
  }, [selectedRefIds, activeProject.id]);

  const toggleMood = (mood: string) => {
    setSelectedMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  };

  const handleCreateConcept = async () => {
    setIsGenerating(true);
    setGenerationStep('Analyzing brief...');

    try {
      const finalEnv = environment === 'Custom' && customEnv ? customEnv : environment;
      const finalCam = cameraLanguage === 'Custom' && customCamera ? customCamera : cameraLanguage;

      const generated = await creativeDirectorService.generateConcept(
        {
          product_name: productName,
          product_description: description,
          objective,
          visual_moods: selectedMoods,
          environment: finalEnv,
          camera_language: finalCam,
          creative_notes: creativeNotes,
          output_format: activeProject.aspect_ratio,
          target_length: activeProject.creative_brief.target_length,
          reference_asset_ids: selectedRefIds
        },
        (step) => setGenerationStep(step)
      );

      setConcept(generated);

      // Persist in project state
      updateActiveProject((prev) => ({
        ...prev,
        creative_concept: generated,
        creative_brief: {
          ...prev.creative_brief,
          product_name: productName,
          product_description: description,
          objective,
          visual_moods: selectedMoods,
          environment: finalEnv,
          camera_language: finalCam,
          creative_notes: creativeNotes,
          reference_asset_ids: selectedRefIds
        }
      }));

      showToast('Creative direction created', 'success');
    } catch {
      showToast('Error synthesizing concept', 'error');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleApplyToStoryboard = () => {
    // Sync shot sequence to project shots while preserving any existing keyframes
    updateActiveProject((prev) => {
      const updatedShots = concept.shot_sequence.map((item, idx) => {
        const existing = prev.shots[idx];
        return {
          id: existing?.id || `shot-${Date.now()}-${idx}`,
          shot_number: `K${idx + 1 < 10 ? '0' : ''}${idx + 1}`,
          title: item.title,
          purpose: item.purpose || `Reveal the physical presence of ${productName}.`,
          visual_description: item.description,
          camera_type: item.camera,
          focal_length: item.lens || '85mm Macro',
          camera_movement: item.camera,
          lens: item.lens || '85mm macro',
          lighting_style: item.lighting || 'Controlled Directional Highlight',
          environment: item.environment || 'Dark Studio',
          duration_seconds: item.duration || 8,
          transition: item.transition || 'Cut to next angle',
          status: existing?.status || 'PLANNED',
          prompt:
            existing?.prompt ||
            `Cinematic commercial still of ${item.title}: ${item.description}, 8k film still`,
          keyframe_url: existing?.keyframe_url || '',
          video_url: existing?.video_url,
          motion_prompt: existing?.motion_prompt || item.description,
          motion_preset: existing?.motion_preset || item.camera,
          model_target: existing?.model_target || 'Veo 2'
        };
      });

      return {
        ...prev,
        shots: updatedShots,
        creative_concept: concept
      };
    });

    showToast('Shot added to storyboard', 'success');
    navigate(`/projects/${activeProject.id}/storyboard`);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-white/[0.06] flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono-code text-[#A855F7] uppercase tracking-widest mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>CREATIVE DIRECTOR</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#FAFAFA]">
            Creative Brief & Treatment
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1 max-w-xl">
            Shape the visual world before creating the first frame.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate(`/projects/${activeProject.id}/storyboard`)}
            className="px-4 py-2 text-xs font-medium text-[#A1A1AA] hover:text-[#FAFAFA] bg-[#101014] hover:bg-[#15151B] border border-white/[0.06] rounded-[10px] transition-colors cursor-pointer"
          >
            Go to Storyboard
          </button>
        </div>
      </div>

      {/* Production Pipeline Indicator */}
      <ProgressIndicator project={activeProject} currentStep="brainstorm" />

      {/* Structured Creative Brief Input Form */}
      <GlowCard className="p-6 lg:p-8 space-y-7">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <span className="text-xs font-mono-code text-[#A855F7] uppercase tracking-wider">
            01 · PRODUCTION BRIEF SPECIFICATION
          </span>
          <span className="text-[11px] font-mono-code text-[#71717A]">
            INPUT DIRECTIVES
          </span>
        </div>

        {/* Product Field */}
        <div>
          <label className="block text-xs font-mono-code text-[#A1A1AA] uppercase tracking-wider mb-1.5">
            Product *
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g. NOVAIR ONE"
            className="w-full sm:w-80 px-3.5 py-2.5 bg-[#15151B] border border-white/[0.08] focus:border-[#A855F7]/60 rounded-[12px] text-sm text-[#FAFAFA] font-medium outline-none transition-colors"
          />
        </div>

        {/* What are we making? */}
        <div>
          <label className="block text-xs font-mono-code text-[#A1A1AA] uppercase tracking-wider mb-1.5">
            What are we making? *
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A premium cinematic product film introducing NOVAIR ONE, an uncompromising spatial acoustic instrument crafted from bead-blasted titanium..."
            className="w-full p-4 bg-[#15151B] border border-white/[0.08] focus:border-[#A855F7]/60 rounded-[14px] text-xs sm:text-sm text-[#FAFAFA] placeholder:text-[#71717A] outline-none leading-relaxed transition-colors resize-none"
          />
        </div>

        {/* Objective Selector */}
        <div>
          <label className="block text-xs font-mono-code text-[#A1A1AA] uppercase tracking-wider mb-2">
            Objective
          </label>
          <div className="flex flex-wrap gap-2">
            {OBJECTIVES.map((obj) => (
              <button
                key={obj}
                type="button"
                onClick={() => setObjective(obj)}
                className={`px-3.5 py-1.5 rounded-[10px] text-xs font-medium border transition-all cursor-pointer ${
                  objective === obj
                    ? 'bg-[#1E1D27] border-[#A855F7]/60 text-[#FAFAFA] shadow-[0_0_12px_rgba(139,92,246,0.25)]'
                    : 'bg-[#101014] border-white/[0.06] text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#15151B]'
                }`}
              >
                {obj}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Mood (Multiple Select) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-mono-code text-[#A1A1AA] uppercase tracking-wider">
              Visual Mood <span className="text-[#71717A] lowercase">(select multiple)</span>
            </label>
            <span className="text-[11px] font-mono-code text-[#C084FC]">
              {selectedMoods.length} selected
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((mood) => {
              const isSelected = selectedMoods.includes(mood);
              return (
                <button
                  key={mood}
                  type="button"
                  onClick={() => toggleMood(mood)}
                  className={`px-3.5 py-1.5 rounded-[10px] text-xs font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1E1D27] border-[#A855F7]/60 text-[#FAFAFA] shadow-[0_0_12px_rgba(139,92,246,0.25)]'
                      : 'bg-[#101014] border-white/[0.06] text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#15151B]'
                  }`}
                >
                  {mood}
                </button>
              );
            })}
          </div>
        </div>

        {/* Environment & Camera Language (2 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Environment */}
          <div>
            <label className="block text-xs font-mono-code text-[#A1A1AA] uppercase tracking-wider mb-2">
              Environment
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {ENVIRONMENTS.map((env) => (
                <button
                  key={env}
                  type="button"
                  onClick={() => setEnvironment(env)}
                  className={`px-3 py-1.5 rounded-[10px] text-xs font-medium border transition-all cursor-pointer ${
                    environment === env
                      ? 'bg-[#1E1D27] border-[#A855F7]/60 text-[#FAFAFA] shadow-sm'
                      : 'bg-[#101014] border-white/[0.06] text-[#A1A1AA] hover:text-[#FAFAFA]'
                  }`}
                >
                  {env}
                </button>
              ))}
            </div>
            {environment === 'Custom' && (
              <input
                type="text"
                value={customEnv}
                onChange={(e) => setCustomEnv(e.target.value)}
                placeholder="Specify custom environment..."
                className="w-full px-3.5 py-2 bg-[#15151B] border border-white/[0.08] rounded-[10px] text-xs text-[#FAFAFA] outline-none mt-2"
              />
            )}
          </div>

          {/* Camera Language */}
          <div>
            <label className="block text-xs font-mono-code text-[#A1A1AA] uppercase tracking-wider mb-2">
              Camera Language
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {CAMERA_LANGUAGES.map((cam) => (
                <button
                  key={cam}
                  type="button"
                  onClick={() => setCameraLanguage(cam)}
                  className={`px-3 py-1.5 rounded-[10px] text-xs font-medium border transition-all cursor-pointer ${
                    cameraLanguage === cam
                      ? 'bg-[#1E1D27] border-[#A855F7]/60 text-[#FAFAFA] shadow-sm'
                      : 'bg-[#101014] border-white/[0.06] text-[#A1A1AA] hover:text-[#FAFAFA]'
                  }`}
                >
                  {cam}
                </button>
              ))}
            </div>
            {cameraLanguage === 'Custom' && (
              <input
                type="text"
                value={customCamera}
                onChange={(e) => setCustomCamera(e.target.value)}
                placeholder="Specify custom camera style..."
                className="w-full px-3.5 py-2 bg-[#15151B] border border-white/[0.08] rounded-[10px] text-xs text-[#FAFAFA] outline-none mt-2"
              />
            )}
          </div>
        </div>

        {/* Reference Awareness (Section 5) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-mono-code text-[#A1A1AA] uppercase tracking-wider">
              Reference Assets
            </label>
            <button
              type="button"
              onClick={() => setIsAssetPickerOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs text-[#C084FC] hover:text-white font-medium cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Reference</span>
            </button>
          </div>

          {referenceAssets.length === 0 ? (
            <div
              onClick={() => setIsAssetPickerOpen(true)}
              className="p-4 rounded-[12px] border border-dashed border-white/[0.1] hover:border-[#A855F7]/40 bg-[#101014]/50 text-center cursor-pointer transition-colors"
            >
              <p className="text-xs text-[#71717A]">
                No reference assets attached yet. Click to select CAD models, material swatches, or lighting plates from the vault.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {referenceAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="group relative rounded-[12px] overflow-hidden border border-white/[0.08] bg-[#101014] p-1"
                >
                  <div className="relative aspect-video rounded-[8px] overflow-hidden bg-black mb-1">
                    <img
                      src={asset.file_url}
                      alt={asset.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedRefIds((prev) => prev.filter((id) => id !== asset.id))
                      }
                      className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-[#EF4444] rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove reference"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[10px] text-[#A1A1AA] truncate px-1">{asset.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Creative Notes */}
        <div>
          <label className="block text-xs font-mono-code text-[#A1A1AA] uppercase tracking-wider mb-1.5">
            Creative Notes <span className="text-[#71717A] lowercase">(optional freeform field)</span>
          </label>
          <textarea
            rows={2}
            value={creativeNotes}
            onChange={(e) => setCreativeNotes(e.target.value)}
            placeholder="Additional constraints, brand voice rules, soundtrack cues, color palettes..."
            className="w-full p-3.5 bg-[#15151B] border border-white/[0.08] focus:border-[#A855F7]/60 rounded-[12px] text-xs text-[#FAFAFA] placeholder:text-[#71717A] outline-none leading-relaxed transition-colors resize-none"
          />
        </div>

        {/* Primary Action Button (Create Concept) */}
        <div className="pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-xs text-[#71717A] font-mono-code">
            ARCHITECTED FOR MULTIMODAL CREATIVE SYNTHESIS
          </div>

          <button
            type="button"
            onClick={handleCreateConcept}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#EC4899] hover:opacity-95 text-white rounded-[12px] text-xs font-semibold shadow-[0_0_24px_rgba(139,92,246,0.35)] transition-all cursor-pointer disabled:opacity-60 active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4" />
            <span>✦ Create Concept</span>
          </button>
        </div>
      </GlowCard>

      {/* Generation State Animation Overlay / Box (Section 6) */}
      {isGenerating && (
        <GlowCard className="p-8 border-[#A855F7]/50 bg-[#15151B] text-center space-y-4">
          <div className="text-[11px] font-mono-code text-[#A855F7] uppercase tracking-widest">
            CREATIVE DIRECTOR
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-[#A855F7]/30 border-t-[#A855F7] animate-spin mx-auto" />
          <div className="space-y-1">
            <h3 className="font-display text-base font-semibold text-[#FAFAFA]">
              {generationStep}
            </h3>
            <p className="text-xs text-[#71717A] font-mono-code">
              Synthesizing cinematic language and 8-beat shot sequence...
            </p>
          </div>
        </GlowCard>
      )}

      {/* Structured Creative Concept Output (Sections 7, 8, 9) */}
      {concept && !isGenerating && (
        <div className="space-y-8 animate-fadeIn">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
            <div>
              <span className="text-[11px] font-mono-code text-[#C084FC] uppercase tracking-wider block">
                SYNTHESIZED CREATIVE TREATMENT
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#FAFAFA] tracking-tight">
                {concept.concept || 'POWER, REFINED'}
              </h2>
            </div>

            <button
              onClick={handleApplyToStoryboard}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:opacity-95 text-white rounded-[12px] text-xs font-semibold shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all cursor-pointer active:scale-[0.98]"
            >
              <Film className="w-4 h-4" />
              <span>Apply Sequence to Storyboard</span>
            </button>
          </div>

          {/* Section 7.1: CONCEPT */}
          <GlowCard className="p-6 lg:p-7 space-y-2">
            <span className="text-[11px] font-mono-code text-[#A855F7] uppercase tracking-wider block">
              CONCEPT
            </span>
            <h3 className="font-display text-xl font-bold text-[#FAFAFA] tracking-tight">
              {concept.concept}
            </h3>
            <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed max-w-4xl">
              {concept.concept_description ||
                'A controlled product reveal that presents NOVAIR ONE as a precision-built piece of modern technology rather than simply an electrical appliance.'}
            </p>
          </GlowCard>

          {/* Section 7.2: CREATIVE DIRECTION */}
          <GlowCard className="p-6 lg:p-7 space-y-2">
            <span className="text-[11px] font-mono-code text-[#A855F7] uppercase tracking-wider block">
              CREATIVE DIRECTION
            </span>
            <p className="text-xs sm:text-sm text-[#FAFAFA] leading-relaxed max-w-4xl">
              {concept.creative_direction_prose ||
                'A disciplined, cinematic visual approach designed for Product Launch. The emotional tone balances quiet authority with visceral engineering precision. Rather than frantic cuts or decorative filler, the film relies on deliberate macro choreography, monolithic surfaces, and negative space to establish the product as a sculptural milestone.'}
            </p>
          </GlowCard>

          {/* Section 7.3: VISUAL LANGUAGE */}
          <div className="space-y-3">
            <span className="text-xs font-mono-code text-[#71717A] uppercase tracking-wider block">
              VISUAL LANGUAGE SPECIFICATIONS
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <GlowCard className="p-5 space-y-1.5">
                <span className="text-[11px] font-mono-code text-[#A855F7] uppercase tracking-wider block">
                  ENVIRONMENT
                </span>
                <p className="text-xs text-[#FAFAFA] font-medium">
                  {concept.visual_language_attributes?.environment || 'Minimal architectural spaces'}
                </p>
              </GlowCard>

              <GlowCard className="p-5 space-y-1.5">
                <span className="text-[11px] font-mono-code text-[#A855F7] uppercase tracking-wider block">
                  LIGHTING
                </span>
                <p className="text-xs text-[#FAFAFA] font-medium">
                  {concept.visual_language_attributes?.lighting || 'Controlled directional light'}
                </p>
              </GlowCard>

              <GlowCard className="p-5 space-y-1.5">
                <span className="text-[11px] font-mono-code text-[#A855F7] uppercase tracking-wider block">
                  MATERIALS
                </span>
                <p className="text-xs text-[#FAFAFA] font-medium">
                  {concept.visual_language_attributes?.materials || 'Matte surfaces, brushed metal, glass'}
                </p>
              </GlowCard>

              <GlowCard className="p-5 space-y-1.5">
                <span className="text-[11px] font-mono-code text-[#A855F7] uppercase tracking-wider block">
                  COLOR
                </span>
                <p className="text-xs text-[#FAFAFA] font-medium">
                  {concept.visual_language_attributes?.color || 'Deep charcoal with restrained warm highlights'}
                </p>
              </GlowCard>

              <GlowCard className="p-5 space-y-1.5">
                <span className="text-[11px] font-mono-code text-[#A855F7] uppercase tracking-wider block">
                  CAMERA
                </span>
                <p className="text-xs text-[#FAFAFA] font-medium">
                  {concept.visual_language_attributes?.camera || 'Slow cinematic movement'}
                </p>
              </GlowCard>

              <GlowCard className="p-5 space-y-1.5">
                <span className="text-[11px] font-mono-code text-[#A855F7] uppercase tracking-wider block">
                  COMPOSITION
                </span>
                <p className="text-xs text-[#FAFAFA] font-medium">
                  {concept.visual_language_attributes?.composition ||
                    'Centered product compositions with generous negative space'}
                </p>
              </GlowCard>
            </div>
          </div>

          {/* Section 8: CINEMATIC RULES */}
          <GlowCard className="p-6 lg:p-7 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
              <ShieldCheck className="w-4 h-4 text-[#A855F7]" />
              <h3 className="font-display text-sm font-semibold text-[#FAFAFA] tracking-tight">
                Cinematic Rules
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                concept.cinematic_rules || [
                  'Preserve product geometry.',
                  'Maintain consistent product proportions.',
                  'Keep branding readable.',
                  'Avoid unnecessary visual clutter.',
                  'Use controlled camera movement.',
                  'Maintain continuity between shots.',
                  'Treat the product as the hero.',
                  'Avoid generic stock-photo aesthetics.'
                ]
              ).map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-[#A1A1AA]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] mt-1.5 shrink-0" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </GlowCard>

          {/* Section 9: SHOT SEQUENCE TIMELINE */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono-code text-[#A855F7] uppercase tracking-wider block">
                  STRUCTURED SHOT SEQUENCE
                </span>
                <h3 className="font-display text-lg font-semibold text-[#FAFAFA] tracking-tight">
                  8-Beat Cinematic Timeline
                </h3>
              </div>
              <button
                onClick={handleApplyToStoryboard}
                className="text-xs text-[#C084FC] hover:underline font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Push Sequence to Storyboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {concept.shot_sequence.map((shot, idx) => (
                <GlowCard key={idx} className="p-5 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono-code text-xs font-bold text-[#C084FC]">
                        {shot.shot_number}
                      </span>
                      <span className="text-[11px] font-mono-code text-[#71717A]">
                        {shot.duration} SEC
                      </span>
                    </div>

                    <h4 className="font-display text-sm font-semibold text-[#FAFAFA] tracking-tight">
                      {shot.title}
                    </h4>

                    {shot.purpose && (
                      <p className="text-xs text-[#C084FC]/90 font-medium mt-1">
                        Purpose: <span className="text-[#FAFAFA] font-normal">{shot.purpose}</span>
                      </p>
                    )}

                    <p className="text-xs text-[#A1A1AA] leading-relaxed mt-1.5">
                      {shot.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/[0.04] grid grid-cols-2 gap-2 text-[11px] font-mono-code text-[#71717A]">
                    <div>
                      <span className="block text-[#71717A]">CAMERA:</span>
                      <span className="text-[#A1A1AA] truncate block">{shot.camera}</span>
                    </div>
                    <div>
                      <span className="block text-[#71717A]">LENS:</span>
                      <span className="text-[#A1A1AA] truncate block">{shot.lens || '85mm Macro'}</span>
                    </div>
                    <div>
                      <span className="block text-[#71717A]">LIGHTING:</span>
                      <span className="text-[#A1A1AA] truncate block">{shot.lighting || 'Controlled Studio'}</span>
                    </div>
                    <div>
                      <span className="block text-[#71717A]">TRANSITION:</span>
                      <span className="text-[#A1A1AA] truncate block">{shot.transition || 'Cut'}</span>
                    </div>
                  </div>
                </GlowCard>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Asset Picker Modal */}
      <AssetPickerModal
        isOpen={isAssetPickerOpen}
        onClose={() => setIsAssetPickerOpen(false)}
        selectedAssetIds={selectedRefIds}
        onConfirm={(ids) => setSelectedRefIds(ids)}
        projectId={activeProject.id}
      />
    </div>
  );
};
