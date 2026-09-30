import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { GlowCard } from '../components/common/GlowCard';
import {
  Settings,
  ShieldCheck,
  Cpu,
  Database,
  Sparkles,
  Video,
  Film,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { showToast } = useProject();
  const [defaultRatio, setDefaultRatio] = useState('16:9');
  const [providerStatuses, setProviderStatuses] = useState({
    openai: { configured: false, provider: 'OpenAI Image Generation', model: 'gpt-image-1', message: '' },
    gemini_veo: { configured: false, provider: 'Google Gemini / Veo', model: 'veo-3.1', message: '' },
    supabase: {
      configured: false,
      storageConfigured: false,
      provider: 'Supabase Cloud Database & Storage',
      urlConfigured: false,
      anonKeyConfigured: false,
      serviceRoleConfigured: false,
      message: ''
    },
    final_assembly: { configured: false, provider: 'Media Processing Pipeline', status: 'Configuration_Ready', message: '' }
  });

  useEffect(() => {
    fetch('/api/providers/status')
      .then((res) => res.json())
      .then((data) => {
        setProviderStatuses((prev) => ({
          ...prev,
          ...data
        }));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 text-[11px] font-mono-code text-[#A855F7] uppercase tracking-widest mb-1">
          <Settings className="w-3.5 h-3.5" />
          <span>SYSTEM & PROVIDER ARCHITECTURE</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#FAFAFA]">
          Workstation Configuration
        </h1>
        <p className="text-xs text-[#A1A1AA] mt-1 max-w-xl">
          Review connected AI provider adapters, security boundaries, and default workspace preferences.
        </p>
      </div>

      {/* Security Notice */}
      <GlowCard className="p-6 border-[#A855F7]/30 bg-[#12111A]">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/20 border border-[#A855F7]/30 flex items-center justify-center text-[#C084FC] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-sm font-semibold text-[#FAFAFA]">
              Zero Client-Side Secret Policy
            </h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              All AI provider calls (OpenAI gpt-image-1 and Google Gemini / Veo) are strictly routed through server-side environment secrets (OPENAI_API_KEY, GEMINI_API_KEY). No keys are stored in browser, localStorage, or exposed to client-side code.
            </p>
          </div>
        </div>
      </GlowCard>

      {/* Section 24: API Configuration Matrix */}
      <div className="space-y-4">
        <h3 className="font-display text-sm font-semibold text-[#FAFAFA] tracking-tight">
          Provider Configuration Matrix
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Image Generation */}
          <GlowCard className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#A855F7]" />
                <h4 className="font-display text-xs font-semibold text-[#FAFAFA]">
                  Image Generation
                </h4>
              </div>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  providerStatuses.openai.configured ? 'bg-[#22C55E]' : 'bg-[#71717A]'
                }`}
              />
            </div>

            <div className="text-xs font-mono-code text-[#C084FC]">
              OpenAI ({providerStatuses.openai.model || 'gpt-image-1'})
            </div>

            <p className="text-xs text-[#71717A] leading-relaxed">
              Synthesizes 4K cinematic keyframes for shot sequence beats.
            </p>

            <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono-code">
              <span className="text-[#71717A]">STATUS:</span>
              <span
                className={
                  providerStatuses.openai.configured ? 'text-[#22C55E]' : 'text-[#A1A1AA]'
                }
              >
                {providerStatuses.openai.configured ? 'Configured' : 'Not configured'}
              </span>
            </div>
          </GlowCard>

          {/* Video Generation */}
          <GlowCard className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-[#A855F7]" />
                <h4 className="font-display text-xs font-semibold text-[#FAFAFA]">
                  Video Generation
                </h4>
              </div>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  providerStatuses.gemini_veo.configured ? 'bg-[#22C55E]' : 'bg-[#71717A]'
                }`}
              />
            </div>

            <div className="text-xs font-mono-code text-[#C084FC]">
              Google Gemini / Veo 3.1
            </div>

            <p className="text-xs text-[#71717A] leading-relaxed">
              Transforms approved keyframes into continuous motion shots.
            </p>

            <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono-code">
              <span className="text-[#71717A]">STATUS:</span>
              <span
                className={
                  providerStatuses.gemini_veo.configured ? 'text-[#22C55E]' : 'text-[#A1A1AA]'
                }
              >
                {providerStatuses.gemini_veo.configured ? 'Configured' : 'Not configured'}
              </span>
            </div>
          </GlowCard>

          {/* Supabase Cloud Persistence & Storage */}
          <GlowCard className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#A855F7]" />
                <h4 className="font-display text-xs font-semibold text-[#FAFAFA]">
                  Cloud Persistence
                </h4>
              </div>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  providerStatuses.supabase.configured ? 'bg-[#22C55E]' : 'bg-[#8B5CF6]'
                }`}
              />
            </div>

            <div className="text-xs font-mono-code text-[#C084FC]">
              Supabase (DB & Storage)
            </div>

            <p className="text-xs text-[#71717A] leading-relaxed">
              Relational tables & media bucket `cinematic-vault`.
            </p>

            <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono-code">
              <span className="text-[#71717A]">STATUS:</span>
              <span
                className={
                  providerStatuses.supabase.configured ? 'text-[#22C55E]' : 'text-[#A1A1AA]'
                }
              >
                {providerStatuses.supabase.configured ? 'Connected' : 'Local Storage Vault'}
              </span>
            </div>
          </GlowCard>

          {/* Final Assembly */}
          <GlowCard className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-[#A855F7]" />
                <h4 className="font-display text-xs font-semibold text-[#FAFAFA]">
                  Final Assembly
                </h4>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" />
            </div>

            <div className="text-xs font-mono-code text-[#C084FC]">
              Media Processing Pipeline
            </div>

            <p className="text-xs text-[#71717A] leading-relaxed">
              Sequence EDL assembly and timeline manifest compiler.
            </p>

            <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono-code">
              <span className="text-[#71717A]">STATUS:</span>
              <span className="text-[#EAB308]">Configuration_Ready</span>
            </div>
          </GlowCard>
        </div>
      </div>

      {/* Production Defaults */}
      <GlowCard className="p-6 space-y-5">
        <h3 className="font-display text-sm font-semibold text-[#FAFAFA] tracking-tight">
          Production Workspace Defaults
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-mono-code text-[#A1A1AA] uppercase mb-1.5">
              Default Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['16:9', '9:16', '1:1'].map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => {
                    setDefaultRatio(ratio);
                    showToast(`Default aspect ratio set to ${ratio}`, 'info');
                  }}
                  className={`py-2 text-xs font-mono-code rounded-[8px] border transition-colors cursor-pointer ${
                    defaultRatio === ratio
                      ? 'bg-[#1E1D27] border-[#A855F7]/50 text-white'
                      : 'bg-[#15151B] border-white/[0.06] text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>
        </div>
      </GlowCard>
    </div>
  );
};
