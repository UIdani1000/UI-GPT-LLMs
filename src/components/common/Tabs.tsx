import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
  size = 'md'
}) => {
  const pad = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-xs';

  return (
    <div
      role="tablist"
      className={`inline-flex items-center gap-1 p-1 bg-[#101014] border border-white/[0.06] rounded-[12px] ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center gap-1.5 font-medium rounded-[8px] transition-all duration-150 whitespace-nowrap cursor-pointer ${pad} ${
              isActive
                ? 'bg-[#1E1D27] text-[#FAFAFA] shadow-[0_2px_8px_rgba(0,0,0,0.4)] border border-white/[0.08]'
                : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-white/[0.03]'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-[10px] font-mono-code ${isActive ? 'text-[#C084FC]' : 'text-[#71717A]'}`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
