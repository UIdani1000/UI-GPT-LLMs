import React, { useState, useEffect } from 'react';
import { Shot, ShotStatus } from '../../types';
import { useProject } from '../../context/ProjectContext';
import { useRouter } from '../../context/RouterContext';
import { StatusBadge } from '../common/StatusBadge';
import { GlowCard } from '../common/GlowCard';
import {
  X,
  Sparkles,
  Copy,
  Trash2,
  Camera,
  SunMedium,
  Clock,
  ArrowRight,
  Maximize2,
  Sliders,
  Check
} from 'lucide-react';

interface ShotDetailPanelProps {
  shot: Shot | null;
  onClose: () => void;
  onDeleteRequest: (shot: Shot) => void;
  projectId: string;
}

export const ShotDetailPanel: React.FC<ShotDetailPanelProps> = ({
  shot,
  onClose,
  onDeleteRequest,
  projectId
}) => {
  const { updateShot, duplicateShot, setSelectedShotId, showToast } = useProject();
  const { navigate } = useRouter();

  const [formData, setFormData] = useState<Shot | null>(shot);

  useEffect(() => {
    setFormData(shot);
  }, [shot]);

  if (!formData) return null;

  const handleChange = (field: keyof Shot, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    updateShot(updated);
  };

  const handleDuplicate = () => {
    const duplicated = duplicateShot(formData.id);
    if (duplicated) {
      setFormData(duplicated);
    }
  };

  const handleOpenKeyframeLab = () => {
    setSelectedShotId(formData.id);
    navigate(`/projects/${projectId}/keyframes`);
  };

  const statusOptions: ShotStatus[] = [
    'PLANNED',
    'KEYFRAME_READY',
    'VIDEO_READY',
    'IN_PROGRESS',
    'FAILED'
  ];

  return (
    <aside
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] lg:w-[500px] bg-[#101014] border-l border-white/[0.08] shadow-[0_0_50px_rgba(0,0,0,0.85)] flex flex-col justify-between overflow-hidden animate-slideInRight"
      aria-label="Shot Detail Editor"
    >
      {/* Top Header */}
      <div>
        <div className="h-14 px-5 border-b border-white/[0.06] flex items-center justify-between bg-[#0E0E12]">
          <div className="flex items-center gap-2.5">
            <span className="font-mono-code text-sm font-bold text-[#C084FC]">
              {formData.shot_number}
            </span>
            <span className="text-white/[0.2]">·</span>
            <span className="font-display text-sm font-semibold text-[#FAFAFA] truncate max-w-[220px]">
              {formData.title}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleDuplicate}
              className="p-1.5 text-[#A1A1AA] hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors cursor-pointer"
              title="Duplicate Shot"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDeleteRequest(formData)}
              className="p-1.5 text-[#A1A1AA] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors cursor-pointer"
              title="Delete Shot"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#A1A1AA] hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors cursor-pointer ml-1"
              aria-label="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Editor Body */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {/* Keyframe Media Preview / Intentional Cinematic Placeholder */}
          <div className="relative aspect-video rounded-[14px] overflow-hidden bg-[#0A0A0D] border border-white/[0.08] group">
            {formData.keyframe_url ? (
              <img
                src={formData.keyframe_url}
                alt={formData.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#15151B] to-[#0A0A0D]">
                <div className="w-10 h-10 rounded-full bg-[#1E1D27] flex items-center justify-center text-[#A855F7] mb-2 border border-white/[0.06]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h5 className="font-display text-xs font-semibold text-[#FAFAFA]">
                  KEYFRAME — NOT CREATED
                </h5>
                <p className="text-[11px] text-[#71717A] mt-0.5 max-w-[240px]">
                  Frame awaiting visual synthesis in Keyframe Lab.
                </p>
              </div>
            )}

            {/* Overlays */}
            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
              <span className="px-2 py-0.5 rounded-[6px] bg-black/75 backdrop-blur-md border border-white/[0.1] text-xs font-mono-code text-white">
                {formData.shot_number}
              </span>
              <span className="px-2 py-0.5 rounded-[6px] bg-black/75 backdrop-blur-md border border-white/[0.1]">
                <StatusBadge status={formData.status} size="sm" />
              </span>
            </div>
          </div>

          {/* Status Selector */}
          <div>
            <label className="block text-[11px] font-mono-code text-[#71717A] uppercase mb-1.5">
              Production Status
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {statusOptions.slice(0, 3).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleChange('status', st)}
                  className={`py-1.5 px-2 text-[10px] font-mono-code rounded-[8px] border transition-colors cursor-pointer truncate ${
                    formData.status === st
                      ? 'bg-[#1E1D27] border-[#A855F7]/60 text-[#FAFAFA]'
                      : 'bg-[#15151B] border-white/[0.06] text-[#71717A] hover:text-[#FAFAFA]'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Shot Title */}
          <div>
            <label className="block text-[11px] font-mono-code text-[#71717A] uppercase mb-1">
              Shot Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-2 bg-[#15151B] border border-white/[0.08] focus:border-[#A855F7]/60 rounded-[10px] text-xs font-medium text-[#FAFAFA] outline-none"
            />
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-[11px] font-mono-code text-[#71717A] uppercase mb-1">
              Purpose
            </label>
            <textarea
              rows={2}
              value={formData.purpose || ''}
              onChange={(e) => handleChange('purpose', e.target.value)}
              placeholder="e.g. Reveal the physical quality of the product."
              className="w-full p-2.5 bg-[#15151B] border border-white/[0.08] focus:border-[#A855F7]/60 rounded-[10px] text-xs text-[#FAFAFA] outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Visual Description */}
          <div>
            <label className="block text-[11px] font-mono-code text-[#71717A] uppercase mb-1">
              Visual Description
            </label>
            <textarea
              rows={3}
              value={formData.visual_description || formData.prompt}
              onChange={(e) => handleChange('visual_description', e.target.value)}
              placeholder="Describe physical product geometry, reflection angles, material highlights..."
              className="w-full p-2.5 bg-[#15151B] border border-white/[0.08] focus:border-[#A855F7]/60 rounded-[10px] text-xs text-[#FAFAFA] outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Camera Specs (Camera movement, Lens, Duration) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono-code text-[#71717A] uppercase mb-1">
                Camera Movement
              </label>
              <input
                type="text"
                value={formData.camera_movement || formData.camera_type}
                onChange={(e) => handleChange('camera_movement', e.target.value)}
                placeholder="e.g. Slow macro push"
                className="w-full px-3 py-2 bg-[#15151B] border border-white/[0.08] rounded-[10px] text-xs text-[#FAFAFA] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono-code text-[#71717A] uppercase mb-1">
                Lens / Optics
              </label>
              <input
                type="text"
                value={formData.lens || formData.focal_length}
                onChange={(e) => handleChange('lens', e.target.value)}
                placeholder="e.g. 85mm macro"
                className="w-full px-3 py-2 bg-[#15151B] border border-white/[0.08] rounded-[10px] text-xs text-[#FAFAFA] outline-none"
              />
            </div>
          </div>

          {/* Environment & Lighting */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono-code text-[#71717A] uppercase mb-1">
                Environment
              </label>
              <input
                type="text"
                value={formData.environment}
                onChange={(e) => handleChange('environment', e.target.value)}
                placeholder="e.g. Dark studio"
                className="w-full px-3 py-2 bg-[#15151B] border border-white/[0.08] rounded-[10px] text-xs text-[#FAFAFA] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono-code text-[#71717A] uppercase mb-1">
                Lighting
              </label>
              <input
                type="text"
                value={formData.lighting_style}
                onChange={(e) => handleChange('lighting_style', e.target.value)}
                placeholder="e.g. Controlled directional highlight"
                className="w-full px-3 py-2 bg-[#15151B] border border-white/[0.08] rounded-[10px] text-xs text-[#FAFAFA] outline-none"
              />
            </div>
          </div>

          {/* Duration & Transition */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono-code text-[#71717A] uppercase mb-1">
                Duration (Seconds)
              </label>
              <input
                type="number"
                min="2"
                max="30"
                value={formData.duration_seconds}
                onChange={(e) =>
                  handleChange('duration_seconds', parseInt(e.target.value) || 6)
                }
                className="w-full px-3 py-2 bg-[#15151B] border border-white/[0.08] rounded-[10px] text-xs text-[#FAFAFA] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono-code text-[#71717A] uppercase mb-1">
                Transition Intention
              </label>
              <input
                type="text"
                value={formData.transition || ''}
                onChange={(e) => handleChange('transition', e.target.value)}
                placeholder="e.g. Rack focus to depth"
                className="w-full px-3 py-2 bg-[#15151B] border border-white/[0.08] rounded-[10px] text-xs text-[#FAFAFA] outline-none"
              />
            </div>
          </div>

          {/* Creative Notes */}
          <div>
            <label className="block text-[11px] font-mono-code text-[#71717A] uppercase mb-1">
              Creative Notes
            </label>
            <textarea
              rows={2}
              value={formData.creative_notes || ''}
              onChange={(e) => handleChange('creative_notes', e.target.value)}
              placeholder="Directorial notes for keyframe synthesis..."
              className="w-full p-2.5 bg-[#15151B] border border-white/[0.08] focus:border-[#A855F7]/60 rounded-[10px] text-xs text-[#FAFAFA] outline-none resize-none leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action Strip (Section 18 & 23: Keyframe Handoff) */}
      <div className="p-4 border-t border-white/[0.06] bg-[#0A0A0D] flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleDuplicate}
          className="px-3 py-2 bg-[#15151B] hover:bg-[#1E1D27] text-[#FAFAFA] rounded-[10px] text-xs font-medium border border-white/[0.08] transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Copy className="w-3.5 h-3.5 text-[#A855F7]" />
          <span>Duplicate</span>
        </button>

        <button
          type="button"
          onClick={handleOpenKeyframeLab}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#EC4899] hover:opacity-95 text-white rounded-[10px] text-xs font-semibold shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all cursor-pointer active:scale-[0.98]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>OPEN IN KEYFRAME LAB</span>
        </button>
      </div>
    </aside>
  );
};
