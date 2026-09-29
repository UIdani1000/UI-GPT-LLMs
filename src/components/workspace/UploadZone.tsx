import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { Asset } from '../../types';

interface UploadZoneProps {
  onFilesSelected: (files: File[], category: Asset['category']) => void;
  activeCategory?: Asset['category'];
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFilesSelected,
  activeCategory = 'Product'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files), activeCategory);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files), activeCategory);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-[20px] p-8 text-center transition-all duration-200 cursor-pointer ${
        isDragging
          ? 'border-[#A855F7] bg-[#8B5CF6]/10 shadow-[0_0_30px_rgba(139,92,246,0.2)]'
          : 'border-white/[0.08] hover:border-white/[0.18] bg-[#101014]/60 hover:bg-[#15151B]/60'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        multiple
        accept="image/*,video/*,.obj,.gltf"
        className="hidden"
      />

      <div className="w-12 h-12 rounded-full bg-[#15151B] border border-white/[0.08] flex items-center justify-center mx-auto mb-3 text-[#A855F7]">
        <UploadCloud className="w-6 h-6" />
      </div>

      <h4 className="font-display text-sm font-semibold text-[#FAFAFA] tracking-tight">
        Drop reference imagery or click to browse
      </h4>
      <p className="text-xs text-[#71717A] mt-1 max-w-md mx-auto">
        Upload 4K plates, material boards, CAD wireframes, lighting cues, or 3D assets.
        Auto-cataloging to category: <span className="text-[#C084FC] font-medium">{activeCategory}</span>.
      </p>

      <div className="mt-4 flex items-center justify-center gap-4 text-[11px] font-mono-code text-[#71717A]">
        <span>PNG / JPG / WEBP / MP4</span>
        <span>·</span>
        <span>UP TO 100MB</span>
      </div>
    </div>
  );
};
