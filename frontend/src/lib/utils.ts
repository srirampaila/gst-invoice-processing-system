import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency strictly in Indian numbering format (e.g. ₹1,27,999.00)
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '—';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format plain number with thousand separators
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) {
    return '—';
  }
  return new Intl.NumberFormat('en-IN').format(num);
}

/**
 * Format percentage (e.g. 75.0%)
 */
export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format milliseconds / seconds into human readable duration
 */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || isNaN(seconds)) {
    return '—';
  }
  if (seconds < 1) {
    return `${(seconds * 1000).toFixed(1)} ms`;
  }
  return `${seconds.toFixed(3)} s`;
}
