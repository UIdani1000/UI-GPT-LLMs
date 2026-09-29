import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Asset } from '../../types';
import { storageService } from '../../services/storageService';
import { Check, Plus, Image as ImageIcon, Search } from 'lucide-react';

interface AssetPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAssetIds: string[];
  onConfirm: (selectedIds: string[]) => void;
  projectId?: string;
}

export const AssetPickerModal: React.FC<AssetPickerModalProps> = ({
  isOpen,
  onClose,
  selectedAssetIds,
  onConfirm,
  projectId
}) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [tempSelected, setTempSelected] = useState<string[]>(selectedAssetIds);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    if (isOpen) {
      setTempSelected(selectedAssetIds);
      loadAssets();
    }
  }, [isOpen, selectedAssetIds, projectId]);

  const loadAssets = async () => {
    const list = await storageService.listAssets(projectId);
    setAssets(list);
  };

  const toggleSelect = (id: string) => {
    setTempSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDone = () => {
    onConfirm(tempSelected);
    onClose();
  };

  const categories = ['All', 'Product', 'References', 'Environment', 'Lighting', 'Brand'];

  const filtered = assets.filter((a) => {
    const catMatch = activeCategory === 'All' || a.category === activeCategory;
    const searchMatch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return catMatch && searchMatch;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reference Asset Vault"
      subtitle="Select CAD models, moodboards, material textures, or lighting plates to anchor the creative brief."
      maxWidth="3xl"
    >
      <div className="space-y-4">
        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 p-1 bg-[#101014] border border-white/[0.06] rounded-[10px]">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 text-xs rounded-[6px] transition-colors whitespace-nowrap cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#1E1D27] text-[#FAFAFA] font-medium'
                    : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference assets..."
              className="w-full sm:w-56 pl-8 pr-3 py-1.5 bg-[#15151B] border border-white/[0.08] rounded-[10px] text-xs text-[#FAFAFA] outline-none placeholder:text-[#71717A]"
            />
          </div>
        </div>

        {/* Assets Grid */}
        <div className="max-h-[50vh] overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filtered.map((asset) => {
            const isSelected = tempSelected.includes(asset.id);
            return (
              <div
                key={asset.id}
                onClick={() => toggleSelect(asset.id)}
                className={`group relative rounded-[14px] overflow-hidden border p-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#A855F7] bg-[#1E1D27] shadow-[0_0_16px_rgba(139,92,246,0.25)]'
                    : 'border-white/[0.06] bg-[#101014] hover:border-white/[0.14] hover:bg-[#15151B]'
                }`}
              >
                <div className="relative aspect-video w-full rounded-[10px] overflow-hidden bg-black/60 mb-2">
                  <img
                    src={asset.file_url}
                    alt={asset.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div
                    className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white'
                        : 'border-white/40 bg-black/60 text-transparent'
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>

                <div className="px-1 pb-1">
                  <h5 className="font-display text-xs font-medium text-[#FAFAFA] truncate">
                    {asset.name}
                  </h5>
                  <div className="text-[10px] font-mono-code text-[#71717A] mt-0.5 truncate">
                    {asset.category}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
          <div className="text-xs font-mono-code text-[#A1A1AA]">
            {tempSelected.length} {tempSelected.length === 1 ? 'asset' : 'assets'} selected
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-[#A1A1AA] hover:text-white rounded-[8px]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDone}
              className="px-4 py-1.5 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white rounded-[10px] text-xs font-medium shadow-[0_0_16px_rgba(139,92,246,0.3)] transition-all cursor-pointer"
            >
              Attach References
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
