import React from 'react';
import { useProject } from '../context/ProjectContext';
import { AssetVault } from '../components/workspace/AssetVault';
import { Layers } from 'lucide-react';

export const AssetsPage: React.FC = () => {
  const { activeProject } = useProject();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 text-[11px] font-mono-code text-[#A855F7] uppercase tracking-widest mb-1">
          <Layers className="w-3.5 h-3.5" />
          <span>LIBRARY ARCHIVE</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#FAFAFA]">
          Asset Vault
        </h1>
        <p className="text-xs text-[#A1A1AA] mt-1 max-w-xl">
          Centralized repository for product CAD stills, lighting cues, material swatches, architectural environments, and branding marks.
        </p>
      </div>

      <AssetVault projectId={activeProject?.id} />
    </div>
  );
};
