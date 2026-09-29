import React from 'react';
import { Project } from '../../types';
import { useRouter } from '../../context/RouterContext';

interface ProgressIndicatorProps {
  project: Project;
  currentStep?: 'overview' | 'brainstorm' | 'storyboard' | 'keyframes' | 'video' | 'final';
  interactive?: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  project,
  currentStep,
  interactive = true
}) => {
  const { navigate } = useRouter();

  const totalShots = project.shots.length || 8;
  const completedKeyframes = project.shots.filter(
    (s) =>
      !!s.keyframe_url ||
      s.status === 'KEYFRAME_READY' ||
      s.status === 'VIDEO_READY' ||
      s.status === 'completed'
  ).length;

  const videoShots = project.shots.filter(
    (s) =>
      s.status === 'VIDEO_READY' ||
      s.status === 'completed' ||
      (s.video_generations && s.video_generations.some((g) => g.is_approved))
  ).length;

  const finalAssemblyPct = totalShots > 0 ? Math.round((videoShots / totalShots) * 100) : 0;

  const steps = [
    {
      id: 'brainstorm',
      label: 'Creative Direction',
      statusText: 'Complete',
      metric: '✓',
      isComplete: true
    },
    {
      id: 'storyboard',
      label: 'Storyboard',
      statusText: `${totalShots} Frames Defined`,
      metric: '✓',
      isComplete: true
    },
    {
      id: 'keyframes',
      label: 'Keyframes',
      statusText: `${completedKeyframes} of ${totalShots} Approved`,
      metric: `${completedKeyframes} / ${totalShots}`,
      isComplete: completedKeyframes >= totalShots
    },
    {
      id: 'video',
      label: 'Video Motion',
      statusText: `${videoShots} of ${totalShots} Generated`,
      metric: `${videoShots} / ${totalShots}`,
      isComplete: videoShots >= totalShots
    },
    {
      id: 'final',
      label: 'Final Film',
      statusText: `${finalAssemblyPct}% Assembled`,
      metric: finalAssemblyPct === 100 ? '✓' : `${finalAssemblyPct}%`,
      isComplete: finalAssemblyPct === 100
    }
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
        {steps.map((step, idx) => {
          const isActive = currentStep === step.id;
          return (
            <div
              key={step.id}
              onClick={() => {
                if (interactive) {
                  navigate(`/projects/${project.id}/${step.id}`);
                }
              }}
              className={`p-3.5 rounded-[14px] border text-left transition-all duration-200 ${
                interactive ? 'cursor-pointer hover:border-white/[0.15]' : ''
              } ${
                isActive
                  ? 'bg-[#15151B] border-[#A855F7]/45 shadow-[0_0_20px_-4px_rgba(139,92,246,0.2)]'
                  : 'bg-[#101014] border-white/[0.06] hover:bg-[#15151B]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono-code text-[#71717A] tracking-wider">
                  0{idx + 1}
                </span>
                <span
                  className={`text-xs font-mono-code ${
                    step.metric === '✓'
                      ? 'text-[#22C55E]'
                      : isActive
                      ? 'text-[#C084FC]'
                      : 'text-[#A1A1AA]'
                  }`}
                >
                  {step.metric}
                </span>
              </div>
              <h4 className="text-xs font-medium text-[#FAFAFA] tracking-tight truncate">
                {step.label}
              </h4>
              <p className="text-[11px] text-[#71717A] tracking-tight mt-0.5 truncate">
                {step.statusText}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
