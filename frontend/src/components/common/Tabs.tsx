import React from 'react';
import { cn } from '../../lib/utils';

export interface TabItem {
  id: string;
  label: string;
  count?: number | string;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pills' | 'editorial';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className,
}) => {
  if (variant === 'pills') {
    return (
      <div className={cn('flex items-center gap-1.5 p-1 bg-[#EFEFEA] rounded-lg border border-[#E2E0D8]', className)}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded transition-all cursor-pointer',
                isActive
                  ? 'bg-white text-[#20251F] shadow-fine font-semibold'
                  : 'text-[#60695C] hover:text-[#20251F]'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.2 rounded font-mono',
                    isActive ? 'bg-[#E6F0E9] text-[#1B523D]' : 'bg-[#DFDDD5] text-[#60695C]'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('border-b border-[#E2E0D8] flex items-center gap-6 overflow-x-auto', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap',
              isActive
                ? 'border-[#246B50] text-[#1B523D] font-semibold'
                : 'border-transparent text-[#60695C] hover:text-[#20251F] hover:border-[#CBC8BD]'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded font-mono',
                  isActive ? 'bg-[#E6F0E9] text-[#1B523D]' : 'bg-[#EFEFEA] text-[#60695C]'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
