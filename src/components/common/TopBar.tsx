import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useProject } from '../../context/ProjectContext';
import {
  ChevronDown,
  Plus,
  Settings,
  Sparkles,
  CheckCircle2,
  FolderDot,
  Menu,
  ListOrdered
} from 'lucide-react';

interface TopBarProps {
  onToggleMobileNav?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleMobileNav }) => {
  const { currentPath, navigate, route } = useRouter();
  const {
    projects,
    activeProject,
    setActiveProjectId,
    isSaving,
    lastSavedAt,
    setIsNewProjectModalOpen,
    queue,
    setIsQueueOpen,
    isCloudConnected
  } = useProject();

  const activeQueueCount = queue.filter(
    (j) => j.status === 'GENERATING' || j.status === 'PROCESSING' || j.status === 'QUEUED'
  ).length;

  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format page title from route
  const getSubpageTitle = () => {
    if (route.isDashboard) return 'Workspace Overview';
    if (route.isAssets) return 'Asset Vault';
    if (route.isSettings) return 'System & Model Configurations';
    if (!route.subPage || route.subPage === 'overview') return 'Production Workspace';
    return route.subPage.charAt(0).toUpperCase() + route.subPage.slice(1);
  };

  return (
    <header className="h-14 bg-[#09090B]/90 backdrop-blur-md border-b border-white/[0.06] px-4 lg:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Zone 1: Current Project / Mobile Menu Trigger */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileNav}
          className="md:hidden p-1.5 text-[#A1A1AA] hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Project Switcher Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-[#101014] hover:bg-[#15151B] border border-white/[0.07] hover:border-white/[0.12] transition-all duration-150 text-left cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-[#8B5CF6] shadow-[0_0_8px_#8B5CF6]" />
            <span className="font-display text-xs font-semibold text-[#FAFAFA] tracking-tight truncate max-w-[140px] sm:max-w-[180px]">
              {activeProject?.name || 'Select Project'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#71717A] ml-0.5 shrink-0" />
          </button>

          {/* Dropdown Menu */}
          {isSwitcherOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-64 bg-[#101014] border border-white/[0.08] rounded-[16px] shadow-[0_12px_32px_rgba(0,0,0,0.7)] p-1.5 z-40">
              <div className="px-2.5 py-1.5 text-[10px] font-mono-code text-[#71717A] uppercase tracking-wider">
                Production Projects
              </div>
              <div className="space-y-0.5 max-h-56 overflow-y-auto">
                {projects.map((proj) => {
                  const isCurrent = proj.id === activeProject?.id;
                  return (
                    <button
                      key={proj.id}
                      onClick={() => {
                        setActiveProjectId(proj.id);
                        setIsSwitcherOpen(false);
                        navigate(`/projects/${proj.id}`);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-[10px] text-xs transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-[#1E1D27] text-white'
                          : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="min-w-0 text-left">
                        <div className="font-medium text-[#FAFAFA] truncate">{proj.name}</div>
                        <div className="text-[10px] font-mono-code text-[#71717A]">
                          {proj.shots.length} SHOTS · {proj.aspect_ratio}
                        </div>
                      </div>
                      {isCurrent && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#A855F7] shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-white/[0.06] mt-1 pt-1">
                <button
                  onClick={() => {
                    setIsSwitcherOpen(false);
                    setIsNewProjectModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-[10px] text-xs font-medium text-[#C084FC] hover:bg-[#8B5CF6]/10 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Project...</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Breadcrumb separator and current stage */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-[#71717A]">
          <span>/</span>
          <span className="text-[#A1A1AA] font-medium">{getSubpageTitle()}</span>
        </div>
      </div>

      {/* Zone 2: Persistence & Vault indicator */}
      <div className="hidden lg:flex items-center gap-3 text-xs text-[#71717A] font-mono-code">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#101014] border border-white/[0.06]">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isSaving
                ? 'bg-[#F59E0B] animate-pulse'
                : isCloudConnected
                ? 'bg-[#22C55E] shadow-[0_0_8px_#22C55E]'
                : 'bg-[#8B5CF6]'
            }`}
          />
          <span className="text-[11px] text-[#A1A1AA]">
            {isSaving
              ? 'Syncing Vault...'
              : isCloudConnected
              ? 'Supabase Cloud Vault'
              : 'Local Vault Synced'}
          </span>
        </div>
      </div>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2">
        {/* Production Queue Button with live active count */}
        <button
          type="button"
          onClick={() => setIsQueueOpen(true)}
          className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#15151B] hover:bg-[#1E1D27] text-[#FAFAFA] border border-white/[0.08] hover:border-white/[0.16] rounded-[10px] text-xs font-medium transition-all cursor-pointer shadow-sm"
          title="Open Production Queue"
        >
          <ListOrdered className="w-3.5 h-3.5 text-[#C084FC]" />
          <span className="hidden sm:inline">Queue</span>
          {activeQueueCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#A855F7] text-white text-[10px] font-mono-code flex items-center justify-center font-bold animate-pulse">
              {activeQueueCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setIsNewProjectModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white rounded-[10px] text-xs font-medium shadow-[0_0_16px_rgba(139,92,246,0.3)] transition-all duration-150 cursor-pointer whitespace-nowrap active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">New Project</span>
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="p-2 text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#15151B] rounded-[10px] border border-white/[0.06] transition-colors cursor-pointer"
          title="System Settings"
          aria-label="Settings"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
