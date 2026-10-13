import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'white' | 'subtle' | 'emerald' | 'amber' | 'crimson';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'white',
  padding = 'md',
  header,
  footer,
  children,
  className,
  ...props
}) => {
  const variantStyles = {
    white: 'bg-white border-[#E2E0D8]',
    subtle: 'bg-[#FAFAF8] border-[#E2E0D8]',
    emerald: 'bg-[#E6F0E9] border-[#C3DCC9]',
    amber: 'bg-[#FDF4E7] border-[#F4D4A4]',
    crimson: 'bg-[#FCECEB] border-[#F3BDB9]',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <div
      className={cn(
        'rounded-lg border shadow-fine transition-all',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {header && (
        <div className="border-b border-[#E2E0D8] px-5 py-3.5 flex items-center justify-between">
          {header}
        </div>
      )}
      <div className={paddingStyles[padding]}>{children}</div>
      {footer && (
        <div className="border-t border-[#E2E0D8] px-5 py-3 bg-[#FAFAF8] rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
};
