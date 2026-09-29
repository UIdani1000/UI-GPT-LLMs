import React, { useState, useEffect } from 'react';
import { Asset } from '../../types';
import { storageService } from '../../services/storageService';
import { useProject } from '../../context/ProjectContext';
import { UploadZone } from './UploadZone';
import { GlowCard } from '../common/GlowCard';
import { Modal } from '../common/Modal';
import {
  Layers,
  Search,
  Trash2,
  Maximize2,
  Tag,
  Filter,
  Check,
  Plus
} from 'lucide-react';

const CATEGORIES: Array<Asset['category'] | 'All'> = [
  'All',
  'Product',
  'References',
  'Environment',
  'Lighting',
  'Brand',
  'Characters',
  'Other'
];

interface AssetVaultProps {
  projectId?: string;
  selectable?: boolean;
  selectedAssetIds?: string[];
  onToggleSelect?: (assetId: string) => void;
}

export const AssetVault: React.FC<AssetVaultProps> = ({
  projectId,
  selectable = false,
  selectedAssetIds = [],
  onToggleSelect
}) => {
  const { showToast } = useProject();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [activeCategory, setActiveCategory] = useState<Asset['category'] | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadAssets();
  }, [projectId]);

  const loadAssets = async () => {
    const list = await storageService.listAssets(projectId);
    setAssets(list);
  };

  const handleUploadFiles = async (files: File[], category: Asset['category']) => {
    setIsUploading(true);
    for (const file of files) {
      await storageService.uploadAsset(file, category, projectId);
    }
    await loadAssets();
    setIsUploading(false);
    showToast(`Uploaded ${files.length} asset${files.length > 1 ? 's' : ''}`, 'success');
  };

  const handleDeleteAsset = async (assetId: string) => {
    await storageService.deleteAsset(assetId);
    await loadAssets();
    if (previewAsset?.id === assetId) {
      setPreviewAsset(null);
    }
    showToast('Asset removed from vault', 'info');
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesCategory = activeCategory === 'All' || asset.category === activeCategory;
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Category buttons */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 p-1 bg-[#101014] border border-white/[0.06] rounded-[12px]">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-[8px] text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#1E1D27] text-[#FAFAFA] border border-white/[0.08] shadow-sm'
                  : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-white/[0.03]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets by tag or name..."
            className="w-full pl-9 pr-3.5 py-1.5 bg-[#101014] border border-white/[0.07] focus:border-[#A855F7]/50 rounded-[10px] text-xs text-[#FAFAFA] placeholder:text-[#71717A] outline-none"
          />
        </div>
      </div>

      {/* Upload Zone */}
      <UploadZone
        onFilesSelected={handleUploadFiles}
        activeCategory={activeCategory === 'All' ? 'Product' : activeCategory}
      />

      {/* Asset Grid */}
      {filteredAssets.length === 0 ? (
        <div className="p-12 text-center rounded-[20px] bg-[#101014] border border-white/[0.06]">
          <Layers className="w-8 h-8 text-[#71717A] mx-auto mb-2 opacity-60" />
          <h4 className="text-sm font-semibold text-[#FAFAFA]">No Assets Found</h4>
          <p className="text-xs text-[#71717A] mt-1">
            Drop files above or switch category filters to populate the library.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredAssets.map((asset) => {
            const isSelected = selectedAssetIds.includes(asset.id);
            return (
              <GlowCard
                key={asset.id}
                interactive
                selected={isSelected}
                onClick={() => {
                  if (selectable) {
                    onToggleSelect?.(asset.id);
                  } else {
                    setPreviewAsset(asset);
                  }
                }}
                className="group relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative aspect-square w-full bg-[#15151B] overflow-hidden border-b border-white/[0.06]">
                    <img
                      src={asset.file_url}
                      alt={asset.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Category overlay */}
                    <div className="absolute top-2 left-2 pointer-events-none">
                      <span className="px-2 py-0.5 rounded-[6px] bg-black/70 backdrop-blur-md border border-white/[0.1] text-[10px] font-mono-code text-[#A1A1AA]">
                        {asset.category}
                      </span>
                    </div>

                    {/* Selection Checkmark */}
                    {selectable && (
                      <div
                        className={`absolute top-2 right-2 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white'
                            : 'border-white/30 bg-black/40'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    )}

                    {/* Quick Preview Action */}
                    {!selectable && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewAsset(asset);
                        }}
                        className="absolute bottom-2 right-2 p-1.5 rounded-[8px] bg-black/70 hover:bg-[#8B5CF6] text-white border border-white/[0.1] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Inspect Asset"
                      >
                        <Maximize2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="p-3">
                    <h5 className="font-display text-xs font-semibold text-[#FAFAFA] truncate group-hover:text-[#C084FC] transition-colors">
                      {asset.name}
                    </h5>

                    {/* Tags (Zero-Pill discipline: unboxed text with · separators) */}
                    <div className="flex items-center gap-1.5 text-[10px] font-mono-code text-[#71717A] mt-1 truncate">
                      {asset.tags.map((tag, idx) => (
                        <React.Fragment key={tag}>
                          {idx > 0 && <span aria-hidden="true">·</span>}
                          <span>{tag}</span>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="px-3 py-2 border-t border-white/[0.04] bg-[#0E0E12] flex items-center justify-between text-[11px] font-mono-code text-[#71717A]">
                  <span>{asset.dimensions || '4K STILL'}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAsset(asset.id);
                    }}
                    className="text-[#71717A] hover:text-[#EF4444] transition-colors p-1"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </GlowCard>
            );
          })}
        </div>
      )}

      {/* Asset Preview Modal */}
      {previewAsset && (
        <Modal
          isOpen={!!previewAsset}
          onClose={() => setPreviewAsset(null)}
          title={previewAsset.name}
          subtitle={`Category: ${previewAsset.category} · Resolution: ${previewAsset.dimensions || '3840x2160'}`}
          maxWidth="3xl"
        >
          <div className="space-y-4">
            <div className="rounded-[16px] overflow-hidden border border-white/[0.08] bg-[#09090B] flex items-center justify-center max-h-[60vh]">
              <img
                src={previewAsset.file_url}
                alt={previewAsset.name}
                referrerPolicy="no-referrer"
                className="max-h-[60vh] w-auto object-contain"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-white/[0.06] text-xs font-mono-code text-[#A1A1AA]">
              <div className="flex items-center gap-2">
                <span>FILE: {previewAsset.file_name}</span>
                <span>·</span>
                <span>SIZE: {previewAsset.size_bytes ? `${Math.round(previewAsset.size_bytes / 1024 / 1024)}MB` : '4.2MB'}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleDeleteAsset(previewAsset.id);
                  }}
                  className="px-3 py-1.5 text-xs text-[#EF4444] hover:bg-[#EF4444]/10 rounded-[8px] transition-colors cursor-pointer"
                >
                  Delete Asset
                </button>
                <a
                  href={previewAsset.file_url}
                  download={previewAsset.file_name}
                  className="px-3 py-1.5 bg-[#1E1D27] hover:bg-[#272635] text-[#FAFAFA] border border-white/[0.08] rounded-[8px] transition-colors cursor-pointer"
                >
                  Download Source
                </a>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
