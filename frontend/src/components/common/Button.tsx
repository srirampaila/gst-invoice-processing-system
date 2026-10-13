import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded transition-all focus:outline-none focus:ring-2 focus:ring-[#246B50]/20 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

    const variantStyles = {
      primary: 'bg-[#246B50] hover:bg-[#1B523D] text-white shadow-fine border border-[#1B523D]/20',
      secondary: 'bg-[#E6F0E9] hover:bg-[#D7E8DC] text-[#1B523D] border border-[#C3DCC9]',
      outline: 'bg-white hover:bg-[#FAFAF8] text-[#20251F] border border-[#E2E0D8] shadow-fine hover:border-[#CBC8BD]',
      danger: 'bg-[#B94B43] hover:bg-[#9F3F38] text-white shadow-fine border border-[#8F342D]/20',
      ghost: 'bg-transparent hover:bg-[#EFEFEA] text-[#20251F]',
    };

    const sizeStyles = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-5 py-2.5 gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
