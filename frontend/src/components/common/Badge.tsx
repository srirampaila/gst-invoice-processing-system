import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps {
  variant?: 'emerald' | 'amber' | 'crimson' | 'neutral' | 'outline' | 'slate';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'sm',
  children,
  className,
  dot = false,
}) => {
  const variantStyles = {
    emerald: 'bg-[#E6F0E9] text-[#1B523D] border-[#C3DCC9]',
    amber: 'bg-[#FDF4E7] text-[#8E5B1A] border-[#F4D4A4]',
    crimson: 'bg-[#FCECEB] text-[#8F342D] border-[#F3BDB9]',
    neutral: 'bg-[#EFEFEA] text-[#20251F] border-[#DFDDD5]',
    slate: 'bg-[#E8EAE6] text-[#40483C] border-[#D0D4CC]',
    outline: 'bg-transparent text-[#60695C] border-[#E2E0D8]',
  };

  const dotColors = {
    emerald: 'bg-[#246B50]',
    amber: 'bg-[#B87928]',
    crimson: 'bg-[#B94B43]',
    neutral: 'bg-[#60695C]',
    slate: 'bg-[#60695C]',
    outline: 'bg-[#8C9488]',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-sm px-2.5 py-1 font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded border tracking-tight transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
};
