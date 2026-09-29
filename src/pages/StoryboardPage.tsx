import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { useRouter } from '../context/RouterContext';
import { ProgressIndicator } from '../components/common/ProgressIndicator';
import { StoryboardGrid } from '../components/workspace/StoryboardGrid';
import { Film, Sparkles, ArrowRight, Plus } from 'lucide-react';

export const StoryboardPage: React.FC = () => {
  const { activeProject, selectedShotId, setSelectedShotId, addShot } = useProject();
  const { navigate } = useRouter();

  if (!activeProject) return null;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Header (Section 17) */}
      <div className="pb-6 border-b border-white/[0.06] flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono-code text-[#A855F7] uppercase tracking-widest mb-1">
            <Film className="w-3.5 h-3.5" />
            <span>STORYBOARD WORKSPACE</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#FAFAFA]">
            STORYBOARD
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1 max-w-xl">
            Build the visual sequence before production begins.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              if (selectedShotId) {
                navigate(`/projects/${activeProject.id}/keyframes`);
              } else if (activeProject.shots.length > 0) {
                setSelectedShotId(activeProject.shots[0].id);
                navigate(`/projects/${activeProject.id}/keyframes`);
              } else {
                const newShot = addShot({
                  title: 'Hero Reveal',
                  purpose: 'Establish product presence and visual identity.'
                });
                setSelectedShotId(newShot.id);
                navigate(`/projects/${activeProject.id}/keyframes`);
              }
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#EC4899] hover:opacity-95 text-white rounded-[12px] text-xs font-semibold shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all cursor-pointer active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open in Keyframe Lab</span>
          </button>
        </div>
      </div>

      {/* Production Pipeline Indicator */}
      <ProgressIndicator project={activeProject} currentStep="storyboard" />

      {/* Storyboard Grid */}
      <StoryboardGrid
        projectId={activeProject.id}
        shots={activeProject.shots}
        selectedShotId={selectedShotId}
        showAddButton={true}
      />
    </div>
  );
};
