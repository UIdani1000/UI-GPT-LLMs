import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { useProject } from '../../context/ProjectContext';
import { FolderX, Plus, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { GlowCard } from './GlowCard';

interface ProjectNotFoundProps {
  requestedId: string;
}

export const ProjectNotFound: React.FC<ProjectNotFoundProps> = ({ requestedId }) => {
  const { navigate } = useRouter();
  const { projects, setActiveProjectId, setIsNewProjectModalOpen } = useProject();

  return (
    <div className="max-w-3xl mx-auto py-16 px-4 space-y-8 animate-in fade-in duration-300">
      <GlowCard className="p-8 sm:p-12 text-center relative overflow-hidden bg-[#101014] border-white/[0.08] shadow-[0_24px_64px_rgba(0,0,0,0.8)]">
        {/* Ambient violet glow */}
        <div className="absolute top-0 right-0 w-80 h-80 glow-ambient-violet opacity-30 pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-[#181722] border border-[#A855F7]/30 flex items-center justify-center text-[#C084FC] mx-auto mb-5 shadow-[0_0_32px_rgba(139,92,246,0.25)]">
          <FolderX className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A855F7]/10 border border-[#A855F7]/20 text-[11px] font-mono-code text-[#C084FC] mb-4">
          <span>PROJECT NOT FOUND</span>
        </div>

        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#FAFAFA] mb-2">
          Workspace Unavailable
        </h2>

        <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-lg mx-auto leading-relaxed mb-6">
          No cinematic production exists matching identifier{' '}
          <code className="text-[#C084FC] font-mono-code bg-[#181722] px-1.5 py-0.5 rounded border border-white/[0.08]">
            {requestedId}
          </code>
          . It may have been archived, removed, or the link may be outdated.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#EC4899] text-white rounded-[12px] text-xs font-semibold shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:opacity-95 transition-all cursor-pointer active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to All Projects</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewProjectModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#15151B] hover:bg-[#1E1D27] text-white rounded-[12px] text-xs font-medium border border-white/[0.08] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#C084FC]" />
            <span>Create New Project</span>
          </button>
        </div>

        {/* Available projects quick switch */}
        {projects.length > 0 && (
          <div className="mt-10 pt-8 border-t border-white/[0.06] text-left">
            <span className="text-[11px] font-mono-code text-[#71717A] uppercase tracking-wider block mb-3">
              Or switch to an active project:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {projects.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setActiveProjectId(p.id);
                    navigate(`/projects/${p.id}`);
                  }}
                  className="p-3 rounded-[12px] bg-[#15151B] hover:bg-[#1E1D27] border border-white/[0.06] hover:border-[#A855F7]/40 flex items-center justify-between text-left transition-all cursor-pointer group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-display text-xs font-semibold text-[#FAFAFA] group-hover:text-white truncate">
                      {p.name}
                    </div>
                    <div className="text-[10px] font-mono-code text-[#71717A] mt-0.5">
                      {p.shots.length} SHOTS · {p.aspect_ratio}
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#71717A] group-hover:text-[#C084FC] shrink-0 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        )}
      </GlowCard>
    </div>
  );
};
