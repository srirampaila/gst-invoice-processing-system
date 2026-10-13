import React from 'react';
import { cn } from '../../lib/utils';
import { Badge } from './Badge';

export interface StatCardProps {
  label: string;
  value: string | number;
  subvalue?: string;
  badgeText?: string;
  badgeVariant?: 'emerald' | 'amber' | 'crimson' | 'neutral' | 'slate';
  icon?: React.ReactNode;
  trend?: 'positive' | 'negative' | 'neutral';
  className?: string;
  accent?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subvalue,
  badgeText,
  badgeVariant = 'neutral',
  icon,
  className,
  accent = false,
}) => {
  return (
    <div
      className={cn(
        'bg-white border border-[#E2E0D8] rounded-lg p-5 shadow-fine flex flex-col justify-between relative overflow-hidden transition-all hover:border-[#CBC8BD]',
        accent && 'border-l-4 border-l-[#246B50]',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#60695C]">
          {label}
        </span>
        {icon && <div className="text-[#60695C]">{icon}</div>}
      </div>

      <div className="flex items-baseline justify-between gap-3 mt-1">
        <div className="text-2xl font-bold text-[#20251F] font-serif tabular-nums tracking-tight">
          {value}
        </div>
        {badgeText && (
          <Badge variant={badgeVariant} size="sm">
            {badgeText}
          </Badge>
        )}
      </div>

      {subvalue && (
        <div className="text-xs text-[#60695C] mt-2 font-normal border-t border-[#F0EFEA] pt-2 flex items-center justify-between">
          <span>{subvalue}</span>
        </div>
      )}
    </div>
  );
};
