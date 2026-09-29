import React from 'react';
import { Camera, Sparkles, SunMedium, Compass, Box } from 'lucide-react';

interface PromptEditorProps {
  value: string;
  onChange: (val: string) => void;
  onGenerate?: () => void;
  onBuildCinematicPrompt?: () => void;
  isGenerating?: boolean;
  disabled?: boolean;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({
  value,
  onChange,
  onGenerate,
  onBuildCinematicPrompt,
  isGenerating = false,
  disabled = false
}) => {
  const insertToken = (token: string) => {
    const updated = value ? `${value.trim()}, ${token}` : token;
    onChange(updated);
  };

  const quickCues = [
    { label: '85mm Macro', category: 'Camera' },
    { label: 'Subtle Violet Rim', category: 'Lighting' },
    { label: 'Obsidian Pedestal', category: 'Surface' },
    { label: 'Atmospheric Fog', category: 'Environment' },
    { label: 'Bead-Blasted Titanium', category: 'Material' },
    { label: 'Shallow Depth of Field', category: 'Optics' }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-mono-code text-[#A1A1AA] uppercase tracking-wider">
            Generation Prompt
          </label>
        </div>

        <div className="flex items-center gap-2">
          {onBuildCinematicPrompt && (
            <button
              type="button"
              onClick={onBuildCinematicPrompt}
              className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono-code text-[#C084FC] hover:text-white bg-[#1E1D27] hover:bg-[#282635] border border-[#A855F7]/30 rounded-[6px] transition-colors cursor-pointer"
              title="Auto-compose prompt using shot purpose and creative concept"
            >
              <Sparkles className="w-3 h-3 text-[#A855F7]" />
              <span>Auto-Compose</span>
            </button>
          )}
          <span className="text-[11px] font-mono-code text-[#71717A]">
            {value.length} CHARS
          </span>
        </div>
      </div>

      <div className="relative">
        <textarea
          rows={5}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Describe product morphology, specular reflections, lighting angles, focal length, color grading..."
          className="w-full p-3.5 bg-[#15151B] border border-white/[0.08] focus:border-[#A855F7]/60 focus:ring-1 focus:ring-[#A855F7]/30 rounded-[14px] text-xs text-[#FAFAFA] placeholder:text-[#71717A] outline-none leading-relaxed transition-colors resize-none"
        />
      </div>

      {/* Quick Injections */}
      <div>
        <div className="text-[10px] font-mono-code text-[#71717A] uppercase mb-1.5">
          Quick Injections:
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickCues.map((cue) => (
            <button
              key={cue.label}
              type="button"
              onClick={() => insertToken(cue.label)}
              className="px-2.5 py-1 bg-[#101014] hover:bg-[#1E1D27] border border-white/[0.06] hover:border-[#A855F7]/40 rounded-[8px] text-[11px] font-mono-code text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors cursor-pointer"
            >
              + {cue.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
