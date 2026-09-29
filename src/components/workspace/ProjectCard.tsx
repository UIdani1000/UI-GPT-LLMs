import React from 'react';
import { Project } from '../../types';
import { useRouter } from '../../context/RouterContext';
import { GlowCard } from '../common/GlowCard';
import { StatusBadge } from '../common/StatusBadge';
import { ArrowRight, Film, Clock, Layers } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { navigate } = useRouter();

  const totalShots = project.shots.length || 8;
  const completedKeyframes = project.shots.filter((s) => s.status === 'completed' || s.status === 'ready').length;
  const videoShots = project.shots.filter((s) => s.video_url || s.status === 'completed').length;

  return (
    <GlowCard
      interactive
      glow="subtle"
      onClick={() => navigate(`/projects/${project.id}`)}
      className="group overflow-hidden flex flex-col justify-between"
    >
      <div>
        {/* Cover Image Container */}
        <div className="relative aspect-video w-full overflow-hidden bg-[#15151B] border-b border-white/[0.06]">
          <img
            src={project.cover_image}
            alt={project.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
          />
          {/* Measured gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#101014] via-[#101014]/40 to-transparent" />

          {/* Top Status */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-[8px] bg-black/60 backdrop-blur-md border border-white/[0.1] text-[10px] font-mono-code text-white">
              {project.aspect_ratio}
            </span>
            <span className="px-2.5 py-1 rounded-[8px] bg-black/60 backdrop-blur-md border border-white/[0.1]">
              <StatusBadge status={project.status} size="sm" />
            </span>
          </div>

          {/* Bottom Title Lockup */}
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="font-display text-lg font-semibold text-white tracking-tight group-hover:text-[#C084FC] transition-colors">
              {project.name}
            </h3>
            <p className="text-xs text-[#A1A1AA] line-clamp-1 mt-0.5">
              {project.tagline}
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5">
          <p className="text-xs text-[#71717A] line-clamp-2 leading-relaxed mb-4">
            {project.description}
          </p>

          {/* Clean Unboxed Metadata */}
          <div className="flex items-center gap-2 text-xs font-mono-code text-[#A1A1AA] mb-4">
            <span>{totalShots} SHOTS</span>
            <span aria-hidden="true" className="text-[#71717A]">·</span>
            <span>{project.target_length_seconds}S TARGET</span>
            <span aria-hidden="true" className="text-[#71717A]">·</span>
            <span>{completedKeyframes} FRAMES READY</span>
          </div>

          {/* Production Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono-code">
              <span className="text-[#71717A]">PIPELINE PROGRESS</span>
              <span className="text-[#FAFAFA]">
                {Math.round(((completedKeyframes + videoShots) / (totalShots * 2)) * 100)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#15151B] rounded-full overflow-hidden border border-white/[0.04]">
              <div
                className="h-full bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#EC4899] rounded-full transition-all duration-300"
                style={{
                  width: `${Math.max(15, Math.min(100, Math.round(((completedKeyframes + videoShots) / (totalShots * 2)) * 100)))}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3.5 border-t border-white/[0.05] bg-[#0D0D11] flex items-center justify-between">
        <span className="text-[11px] font-mono-code text-[#71717A]">
          UPDATED {new Date(project.updated_at).toLocaleDateString()}
        </span>
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#C084FC] group-hover:translate-x-0.5 transition-transform">
          <span>Open Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </GlowCard>
  );
};
