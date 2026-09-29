import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { useRouter } from '../../context/RouterContext';
import { Modal } from '../common/Modal';
import { AspectRatio, TargetDuration } from '../../types';
import { UploadCloud, Sparkles, FileText, Film, Clock } from 'lucide-react';

export const NewProjectModal: React.FC = () => {
  const { isNewProjectModalOpen, setIsNewProjectModalOpen, createProject } = useProject();
  const { navigate } = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [targetLength, setTargetLength] = useState<TargetDuration>('60 sec');
  const [customLength, setCustomLength] = useState(60);
  const [creativeDirection, setCreativeDirection] = useState('');
  const [referenceFiles, setReferenceFiles] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let targetSec = 60;
    if (targetLength === '15 sec') targetSec = 15;
    else if (targetLength === '30 sec') targetSec = 30;
    else if (targetLength === '45 sec') targetSec = 45;
    else if (targetLength === '60 sec') targetSec = 60;
    else if (targetLength === 'Custom') targetSec = Number(customLength) || 60;

    const newProj = createProject({
      name: name.trim().toUpperCase(),
      description: description.trim(),
      aspect_ratio: aspectRatio,
      target_length_seconds: targetSec,
      creative_brief: {
        product_description: description,
        target_length: targetLength,
        creative_constraints: creativeDirection,
        visual_references: referenceFiles
      }
    });

    // Reset form
    setName('');
    setDescription('');
    setCreativeDirection('');
    setReferenceFiles([]);
    setIsNewProjectModalOpen(false);

    // Navigate to workspace
    navigate(`/projects/${newProj.id}`);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const names = Array.from(e.dataTransfer.files).map((f) => f.name);
      setReferenceFiles((prev) => [...prev, ...names]);
    }
  };

  return (
    <Modal
      isOpen={isNewProjectModalOpen}
      onClose={() => setIsNewProjectModalOpen(false)}
      title="Create Cinematic Production"
      subtitle="Establish the product brief, visual targets, and timeline before generating frames."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Project Name */}
        <div>
          <label className="block text-xs font-mono-code text-[#A1A1AA] uppercase tracking-wider mb-1.5">
            Project Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. NOVAIR ONE, VORTEX CHRONO, HYPERION"
            className="w-full px-3.5 py-2.5 bg-[#15151B] border border-white/[0.08] focus:border-[#A855F7]/60 focus:ring-1 focus:ring-[#A855F7]/30 rounded-[12px] text-sm text-[#FAFAFA] placeholder:text-[#71717A] outline-none transition-colors"
          />
        </div>

        {/* Product Description */}
        <div>
          <label className="block text-xs font-mono-code text-[#A1A1AA] uppercase tracking-wider mb-1.5">
            Product Description *
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the product geometry, materials, tactile feel, purpose, and key engineering features..."
            className="w-full px-3.5 py-2.5 bg-[#15151B] border border-white/[0.08] focus:border-[#A855F7]/60 focus:ring-1 focus:ring-[#A855F7]/30 rounded-[12px] text-sm text-[#FAFAFA] placeholder:text-[#71717A] outline-none transition-colors resize-none"
          />
        </div>

        {/* Output Format & Target Length (Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Output Format */}
          <div>
            <label className="block text-xs font-mono-code text-[#A1A1AA] uppercase tracking-wider mb-1.5">
              Output Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['16:9', '9:16', '1:1'] as AspectRatio[]).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setAspectRatio(fmt)}
                  className={`py-2 px-3 text-xs font-mono-code rounded-[10px] border transition-all cursor-pointer ${
                    aspectRatio === fmt
                      ? 'bg-[#1E1D27] border-[#A855F7]/50 text-[#FAFAFA] shadow-[0_0_12px_rgba(139,92,246,0.2)]'
                      : 'bg-[#15151B] border-white/[0.06] text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#1B1A22]'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Target Film Length */}
          <div>
            <label className="block text-xs font-mono-code text-[#A1A1AA] uppercase tracking-wider mb-1.5">
              Target Film Length
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['15 sec', '30 sec', '45 sec', '60 sec'] as TargetDuration[]).map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setTargetLength(dur)}
                  className={`py-2 px-1 text-[11px] font-mono-code rounded-[10px] border transition-all cursor-pointer truncate ${
                    targetLength === dur
                      ? 'bg-[#1E1D27] border-[#A855F7]/50 text-[#FAFAFA] shadow-[0_0_12px_rgba(139,92,246,0.2)]'
                      : 'bg-[#15151B] border-white/[0.06] text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#1B1A22]'
                  }`}
                >
                  {dur}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product References Upload Area */}
        <div>
          <label className="block text-xs font-mono-code text-[#A1A1AA] uppercase tracking-wider mb-1.5">
            Product References & CAD Stills
          </label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="border border-dashed border-white/[0.12] hover:border-[#A855F7]/40 rounded-[14px] p-4 text-center bg-[#15151B]/50 transition-colors cursor-pointer"
            onClick={() => {
              const mock = `ref_cad_${Date.now().toString().slice(-4)}.png`;
              setReferenceFiles((prev) => [...prev, mock]);
            }}
          >
            <UploadCloud className="w-5 h-5 text-[#A855F7] mx-auto mb-1.5" />
            <p className="text-xs text-[#FAFAFA] font-medium">
              Click or drag reference images, sketches, or 3D renders
            </p>
            <p className="text-[11px] text-[#71717A] mt-0.5">
              Supports PNG, JPG, WEBP up to 25MB
            </p>
          </div>

          {referenceFiles.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {referenceFiles.map((f, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#101014] border border-white/[0.08] rounded-[8px] text-[11px] font-mono-code text-[#A1A1AA]"
                >
                  <FileText className="w-3 h-3 text-[#A855F7]" />
                  <span className="truncate max-w-[140px]">{f}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Creative Direction (Optional) */}
        <div>
          <label className="block text-xs font-mono-code text-[#A1A1AA] uppercase tracking-wider mb-1.5">
            Creative Direction Notes <span className="text-[#71717A] lowercase">(optional)</span>
          </label>
          <textarea
            rows={2}
            value={creativeDirection}
            onChange={(e) => setCreativeDirection(e.target.value)}
            placeholder="Mood cues, camera constraints, lighting preferences, specific materials or color codes..."
            className="w-full px-3.5 py-2 bg-[#15151B] border border-white/[0.08] focus:border-[#A855F7]/60 focus:ring-1 focus:ring-[#A855F7]/30 rounded-[12px] text-xs text-[#FAFAFA] placeholder:text-[#71717A] outline-none transition-colors resize-none"
          />
        </div>

        {/* Form Actions */}
        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setIsNewProjectModalOpen(false)}
            className="px-4 py-2 text-xs font-medium text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-white/[0.05] rounded-[10px] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#EC4899] hover:opacity-95 text-white rounded-[10px] text-xs font-semibold shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all cursor-pointer active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create Project</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
