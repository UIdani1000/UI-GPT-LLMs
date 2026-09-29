import React from 'react';
import { useProject } from '../context/ProjectContext';
import { useRouter } from '../context/RouterContext';
import { ProgressIndicator } from '../components/common/ProgressIndicator';
import { StoryboardGrid } from '../components/workspace/StoryboardGrid';
import { GlowCard } from '../components/common/GlowCard';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Sparkles,
  Compass,
  Film,
  Video,
  Clapperboard,
  ArrowRight,
  Camera,
  Layers,
  FileText
} from 'lucide-react';

export const WorkspaceOverviewPage: React.FC = () => {
  const { activeProject } = useProject();
  const { navigate, route } = useRouter();

  if (!activeProject) {
    return (
      <div className="p-12 text-center">
        <p className="text-sm text-[#71717A]">No active project loaded.</p>
      </div>
    );
  }

  const stages = [
    { id: 'brainstorm', label: 'BRAINSTORM' },
    { id: 'storyboard', label: 'STORYBOARD' },
    { id: 'keyframes', label: 'KEYFRAMES' },
    { id: 'video', label: 'VIDEO' },
    { id: 'final', label: 'FINAL' }
  ];

  return (
    <div className="space-y-8">
      {/* Project Workspace Command Center Header (Section 2) */}
      <div className="relative rounded-[24px] overflow-hidden bg-[#101014] border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        {/* Subtle atmospheric ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 glow-ambient-violet pointer-events-none opacity-50" />

        <div className="relative z-10 p-6 lg:p-8 space-y-5">
          {/* Top metadata & Title Lockup */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#FAFAFA]">
                {activeProject.name}
              </h1>

              <p className="font-display text-base text-[#A855F7] font-medium tracking-tight">
                {activeProject.tagline || activeProject.creative_concept?.concept || 'Power, refined.'}
              </p>

              {/* Unboxed Metadata (8 SHOTS · 16:9 · 64 SEC TARGET · IN PROGRESS) */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono-code text-[#A1A1AA]">
                <span className="font-semibold text-white">{activeProject.shots.length} SHOTS</span>
                <span aria-hidden="true" className="text-[#71717A]">·</span>
                <span>{activeProject.aspect_ratio}</span>
                <span aria-hidden="true" className="text-[#71717A]">·</span>
                <span>{activeProject.target_length_seconds} SEC TARGET</span>
                <span aria-hidden="true" className="text-[#71717A]">·</span>
                <StatusBadge status={activeProject.status} size="sm" />
              </div>
            </div>

            {/* Quick Action Button Group */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => navigate(`/projects/${activeProject.id}/brainstorm`)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#15151B] hover:bg-[#1E1D27] text-white rounded-[10px] text-xs font-medium border border-white/[0.08] transition-colors cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-[#C084FC]" />
                <span>Creative Director</span>
              </button>

              <button
                type="button"
                onClick={() => navigate(`/projects/${activeProject.id}/keyframes`)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white rounded-[10px] text-xs font-semibold shadow-[0_0_16px_rgba(139,92,246,0.3)] transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Direct Keyframes</span>
              </button>
            </div>
          </div>

          {/* Clear Production Navigation (BRAINSTORM · STORYBOARD · KEYFRAMES · VIDEO · FINAL) */}
          <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2 overflow-x-auto pb-1">
            {stages.map((stage) => {
              const isActive = route.subPage === stage.id;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => navigate(`/projects/${activeProject.id}/${stage.id}`)}
                  className={`px-4 py-2 rounded-[10px] text-xs font-mono-code font-semibold tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#1E1D27] text-white border border-[#A855F7]/50 shadow-[0_0_16px_rgba(139,92,246,0.25)]'
                      : 'bg-[#101014] text-[#71717A] hover:text-[#FAFAFA] hover:bg-[#15151B] border border-transparent'
                  }`}
                >
                  {stage.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Integrated Production Status Indicator (Section 2) */}
        <div className="px-6 lg:px-8 pb-6 border-t border-white/[0.05] pt-5 bg-[#0E0E12]/70">
          <div className="text-[11px] font-mono-code text-[#71717A] uppercase tracking-wider mb-2.5">
            PRODUCTION PIPELINE PROGRESS
          </div>
          <ProgressIndicator project={activeProject} currentStep="overview" />
        </div>
      </div>

      {/* Creative Concept Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlowCard className="p-6 col-span-1 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#A855F7]" />
              <h3 className="font-display text-sm font-semibold text-[#FAFAFA] tracking-tight">
                Creative Direction Summary
              </h3>
            </div>
            <button
              onClick={() => navigate(`/projects/${activeProject.id}/brainstorm`)}
              className="text-xs text-[#C084FC] hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>Refine Concept</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3 text-xs leading-relaxed">
            <div>
              <span className="font-mono-code text-[11px] text-[#71717A] uppercase block">
                Core Concept
              </span>
              <p className="text-[#FAFAFA] font-medium mt-0.5 text-sm">
                {activeProject.creative_concept.concept}
              </p>
              {activeProject.creative_concept.concept_description && (
                <p className="text-[#A1A1AA] text-xs mt-1">
                  {activeProject.creative_concept.concept_description}
                </p>
              )}
            </div>

            <div>
              <span className="font-mono-code text-[11px] text-[#71717A] uppercase block">
                Creative Direction
              </span>
              <p className="text-[#A1A1AA] mt-0.5 leading-relaxed">
                {activeProject.creative_concept.creative_direction_prose ||
                  activeProject.creative_concept.visual_language}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <span className="font-mono-code text-[11px] text-[#71717A] uppercase block">
                  Camera Philosophy
                </span>
                <p className="text-[#A1A1AA] mt-0.5">
                  {activeProject.creative_concept.visual_language_attributes?.camera ||
                    activeProject.creative_concept.camera_language}
                </p>
              </div>

              <div>
                <span className="font-mono-code text-[11px] text-[#71717A] uppercase block">
                  Lighting Atmosphere
                </span>
                <p className="text-[#A1A1AA] mt-0.5">
                  {activeProject.creative_concept.visual_language_attributes?.lighting ||
                    activeProject.creative_concept.lighting}
                </p>
              </div>
            </div>
          </div>
        </GlowCard>

        {/* Technical Target Specs */}
        <GlowCard className="p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06] mb-4">
              <Camera className="w-4 h-4 text-[#A855F7]" />
              <h3 className="font-display text-sm font-semibold text-[#FAFAFA] tracking-tight">
                Camera Specifications
              </h3>
            </div>

            <div className="space-y-3 text-xs font-mono-code">
              <div className="flex items-center justify-between">
                <span className="text-[#71717A]">FORMAT</span>
                <span className="text-[#FAFAFA]">16:9 DCI 4K</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#71717A]">BASE OPTICS</span>
                <span className="text-[#FAFAFA]">85mm Macro T2.9</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#71717A]">COLOR PROFILE</span>
                <span className="text-[#FAFAFA]">ACEScct 32-bit</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#71717A]">LIGHTING ATMOSPHERE</span>
                <span className="text-[#C084FC]">Violet Rim Grazing</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#71717A]">VIDEO MODEL</span>
                <span className="text-[#22C55E]">Google Veo 2</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(`/projects/${activeProject.id}/keyframes`)}
            className="w-full mt-4 py-2 bg-[#15151B] hover:bg-[#1E1D27] text-white rounded-[10px] text-xs font-medium border border-white/[0.08] transition-colors cursor-pointer text-center block"
          >
            Launch Keyframe Studio
          </button>
        </GlowCard>
      </div>

      {/* Visual Storyboard Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-[#FAFAFA] tracking-tight">
              Storyboard Sequence ({activeProject.shots.length} Shots)
            </h2>
            <p className="text-xs text-[#71717A]">
              Click any frame to inspect, edit details, duplicate, or push to the Keyframe Lab.
            </p>
          </div>

          <button
            onClick={() => navigate(`/projects/${activeProject.id}/storyboard`)}
            className="text-xs text-[#C084FC] hover:underline font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Storyboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <StoryboardGrid
          projectId={activeProject.id}
          shots={activeProject.shots}
          showAddButton={true}
        />
      </div>
    </div>
  );
};
