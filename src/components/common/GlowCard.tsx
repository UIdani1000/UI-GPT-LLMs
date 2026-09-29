import React from 'react';

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  selected?: boolean;
  interactive?: boolean;
  glow?: 'none' | 'subtle' | 'ambient';
  className?: string;
  elevated?: boolean;
}

export const GlowCard: React.FC<GlowCardProps> = ({
  children,
  selected = false,
  interactive = false,
  glow = 'none',
  className = '',
  elevated = false,
  ...props
}) => {
  const bgClass = elevated ? 'bg-[#15151B]' : 'bg-[#101014]';
  const hoverClass = interactive
    ? 'hover:bg-[#1B1A22] hover:border-white/[0.12] cursor-pointer transition-all duration-200'
    : '';

  const selectedClass = selected
    ? 'border-[#A855F7]/45 shadow-[0_0_24px_-4px_rgba(139,92,246,0.22)]'
    : 'border-white/[0.07]';

  const glowStyleClass =
    glow === 'subtle' && !selected
      ? 'shadow-[0_0_24px_-6px_rgba(139,92,246,0.14)]'
      : glow === 'ambient' && !selected
      ? 'shadow-[0_0_36px_-8px_rgba(168,85,247,0.12)]'
      : '';

  return (
    <div
      className={`rounded-[20px] border ${bgClass} ${selectedClass} ${hoverClass} ${glowStyleClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
