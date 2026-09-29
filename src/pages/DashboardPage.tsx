import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { useRouter } from '../context/RouterContext';
import { ProjectCard } from '../components/workspace/ProjectCard';
import { Plus, Sparkles, Film, Clock, Search, Filter } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { projects, setIsNewProjectModalOpen } = useProject();
  const { navigate } = useRouter();
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed' | 'draft'>('all');
  const [search, setSearch] = useState('');

  const filtered = projects.filter((p) => {
    const matchesFilter = filter === 'all' || p.status === filter;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.tagline.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalShots = projects.reduce((acc, p) => acc + p.shots.length, 0);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.06]">
        <div>
          <span className="text-[11px] font-mono-code text-[#A855F7] uppercase tracking-widest block mb-1">
            CREATIVE PRODUCTION WORKSTATION
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#FAFAFA]">
            CINEMATIC LAB
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-1 max-w-xl">
            Turn ideas into cinematic product films. Direct visual mood, storyboard sequences, generate keyframes, and orchestrate camera motion.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#EC4899] hover:opacity-95 text-white rounded-[12px] text-xs font-semibold shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Production Overview Metrics Strip (Clean unboxed figures with tabular numbers) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-[16px] bg-[#101014] border border-white/[0.06]">
          <span className="text-[11px] font-mono-code text-[#71717A] uppercase block mb-1">
            ACTIVE PRODUCTIONS
          </span>
          <span className="font-display text-2xl font-bold text-[#FAFAFA] tabular-nums">
            {projects.length}
          </span>
        </div>

        <div className="p-4 rounded-[16px] bg-[#101014] border border-white/[0.06]">
          <span className="text-[11px] font-mono-code text-[#71717A] uppercase block mb-1">
            SHOTS DIRECTED
          </span>
          <span className="font-display text-2xl font-bold text-[#C084FC] tabular-nums">
            {totalShots}
          </span>
        </div>

        <div className="p-4 rounded-[16px] bg-[#101014] border border-white/[0.06]">
          <span className="text-[11px] font-mono-code text-[#71717A] uppercase block mb-1">
            PRIMARY RATIO
          </span>
          <span className="font-display text-2xl font-bold text-[#FAFAFA]">
            16:9 CINE
          </span>
        </div>

        <div className="p-4 rounded-[16px] bg-[#101014] border border-white/[0.06]">
          <span className="text-[11px] font-mono-code text-[#71717A] uppercase block mb-1">
            AI PIPELINES
          </span>
          <span className="font-display text-2xl font-bold text-[#22C55E]">
            READY
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 p-1 bg-[#101014] border border-white/[0.06] rounded-[10px]">
          {(['all', 'in_progress', 'completed', 'draft'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-mono-code uppercase transition-colors cursor-pointer ${
                filter === mode
                  ? 'bg-[#1E1D27] text-white shadow-sm'
                  : 'text-[#71717A] hover:text-[#FAFAFA]'
              }`}
            >
              {mode.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-9 pr-3.5 py-1.5 bg-[#101014] border border-white/[0.07] focus:border-[#A855F7]/50 rounded-[10px] text-xs text-[#FAFAFA] placeholder:text-[#71717A] outline-none"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((proj) => (
          <ProjectCard key={proj.id} project={proj} />
        ))}

        {/* Create Project Placeholder Card */}
        <div
          onClick={() => setIsNewProjectModalOpen(true)}
          className="rounded-[20px] border border-dashed border-white/[0.12] hover:border-[#A855F7]/50 bg-[#101014]/40 hover:bg-[#15151B]/60 p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-[300px] group"
        >
          <div className="w-12 h-12 rounded-full bg-[#15151B] group-hover:bg-[#8B5CF6]/20 border border-white/[0.08] group-hover:border-[#A855F7]/40 flex items-center justify-center text-[#71717A] group-hover:text-[#C084FC] mb-3 transition-all">
            <Plus className="w-6 h-6" />
          </div>
          <h3 className="font-display text-sm font-semibold text-[#FAFAFA] tracking-tight">
            Create New Production
          </h3>
          <p className="text-xs text-[#71717A] max-w-xs mt-1">
            Establish product brief, target film length, and launch creative director workflow.
          </p>
        </div>
      </div>
    </div>
  );
};
