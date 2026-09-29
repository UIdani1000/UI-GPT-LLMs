import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { useProject } from '../../context/ProjectContext';
import {
  LayoutDashboard,
  Compass,
  Film,
  Sparkles,
  Video,
  Clapperboard,
  Layers,
  Settings,
  ChevronRight,
  FolderOpen
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const { currentPath, navigate, route } = useRouter();
  const { activeProject } = useProject();

  const projectId = activeProject?.id || 'proj-novair-one';

  const workspaceNav = [
    {
      id: 'overview',
      label: 'Overview',
      path: `/projects/${projectId}`,
      icon: LayoutDashboard,
      active: route.projectId === projectId && route.subPage === 'overview'
    },
    {
      id: 'brainstorm',
      label: 'Brainstorm',
      path: `/projects/${projectId}/brainstorm`,
      icon: Compass,
      active: route.projectId === projectId && route.subPage === 'brainstorm'
    },
    {
      id: 'storyboard',
      label: 'Storyboard',
      path: `/projects/${projectId}/storyboard`,
      icon: Film,
      active: route.projectId === projectId && route.subPage === 'storyboard'
    },
    {
      id: 'keyframes',
      label: 'Keyframes',
      path: `/projects/${projectId}/keyframes`,
      icon: Sparkles,
      active: route.projectId === projectId && route.subPage === 'keyframes'
    },
    {
      id: 'video',
      label: 'Video',
      path: `/projects/${projectId}/video`,
      icon: Video,
      active: route.projectId === projectId && route.subPage === 'video'
    },
    {
      id: 'final',
      label: 'Final',
      path: `/projects/${projectId}/final`,
      icon: Clapperboard,
      active: route.projectId === projectId && route.subPage === 'final'
    }
  ];

  const libraryNav = [
    {
      id: 'assets',
      label: 'Assets',
      path: '/assets',
      icon: Layers,
      active: route.isAssets
    }
  ];

  const systemNav = [
    {
      id: 'dashboard',
      label: 'All Projects',
      path: '/',
      icon: FolderOpen,
      active: route.isDashboard
    },
    {
      id: 'settings',
      label: 'Settings',
      path: '/settings',
      icon: Settings,
      active: route.isSettings
    }
  ];

  return (
    <aside
      className={`h-screen sticky top-0 bg-[#09090B] border-r border-white/[0.06] flex flex-col justify-between transition-all duration-200 select-none z-30 ${
        collapsed ? 'w-16' : 'w-56 lg:w-60'
      }`}
    >
      <div>
        {/* Brand header */}
        <div className="h-14 flex items-center px-4 border-b border-white/[0.06]">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-[#7C3AED] via-[#A855F7] to-[#EC4899] flex items-center justify-center p-[1px] shadow-[0_0_16px_rgba(139,92,246,0.35)] shrink-0">
              <div className="w-full h-full bg-[#101014] rounded-[7px] flex items-center justify-center">
                <span className="font-display text-xs font-bold text-[#FAFAFA]">C</span>
              </div>
            </div>
            {!collapsed && (
              <div className="leading-none">
                <span className="font-display text-sm font-semibold tracking-wider text-[#FAFAFA] group-hover:text-white transition-colors">
                  CINEMATIC LAB
                </span>
                <span className="block text-[9px] font-mono-code text-[#71717A] tracking-widest mt-0.5">
                  IDEA → MOTION
                </span>
              </div>
            )}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="py-4 px-2 space-y-6">
          {/* Workspace */}
          <div>
            {!collapsed && (
              <div className="px-2.5 mb-2 text-[10px] font-mono-code text-[#71717A] uppercase tracking-wider">
                Workspace
              </div>
            )}
            <nav className="space-y-0.5">
              {workspaceNav.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[10px] text-xs font-medium transition-all duration-150 cursor-pointer ${
                      item.active
                        ? 'bg-[#15151B] text-[#FAFAFA] border border-white/[0.08] shadow-[0_0_16px_-4px_rgba(139,92,246,0.25)]'
                        : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-white/[0.03]'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        item.active ? 'text-[#C084FC]' : 'text-[#71717A]'
                      }`}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Library */}
          <div>
            {!collapsed && (
              <div className="px-2.5 mb-2 text-[10px] font-mono-code text-[#71717A] uppercase tracking-wider">
                Library
              </div>
            )}
            <nav className="space-y-0.5">
              {libraryNav.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[10px] text-xs font-medium transition-all duration-150 cursor-pointer ${
                      item.active
                        ? 'bg-[#15151B] text-[#FAFAFA] border border-white/[0.08] shadow-[0_0_16px_-4px_rgba(139,92,246,0.25)]'
                        : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-white/[0.03]'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        item.active ? 'text-[#C084FC]' : 'text-[#71717A]'
                      }`}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* System */}
          <div>
            {!collapsed && (
              <div className="px-2.5 mb-2 text-[10px] font-mono-code text-[#71717A] uppercase tracking-wider">
                System
              </div>
            )}
            <nav className="space-y-0.5">
              {systemNav.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[10px] text-xs font-medium transition-all duration-150 cursor-pointer ${
                      item.active
                        ? 'bg-[#15151B] text-[#FAFAFA] border border-white/[0.08] shadow-[0_0_16px_-4px_rgba(139,92,246,0.25)]'
                        : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-white/[0.03]'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        item.active ? 'text-[#C084FC]' : 'text-[#71717A]'
                      }`}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Footer / Active Project Summary */}
      {!collapsed && activeProject && (
        <div className="p-3 m-2 rounded-[14px] bg-[#101014] border border-white/[0.06]">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-[#71717A] font-mono-code uppercase">Active Project</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
          </div>
          <p className="text-xs font-medium text-[#FAFAFA] truncate">{activeProject.name}</p>
          <div className="mt-1 flex items-center gap-2 text-[10px] font-mono-code text-[#71717A]">
            <span>{activeProject.shots.length} SHOTS</span>
            <span>·</span>
            <span>{activeProject.aspect_ratio}</span>
          </div>
        </div>
      )}
    </aside>
  );
};
