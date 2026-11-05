import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toFiniteNumber(value: unknown, fallback: number = 0): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === 'string') {
    const normalized = value.replace(/,/g, '').replace(/%$/g, '').trim();
    if (!normalized) return fallback;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function formatNumber(num: unknown, decimals: number = 2): string {
  const safeNumber = toFiniteNumber(num);
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(safeNumber);
}

export function formatCurrency(amount: unknown, currency: string = 'USD'): string {
  const safeAmount = toFiniteNumber(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(safeAmount);
}

export function formatPercentage(value: unknown, decimals: number = 2): string {
  const safeValue = toFiniteNumber(value);
  return `${safeValue >= 0 ? '+' : ''}${formatNumber(safeValue, decimals)}%`;
}

export function formatVolume(volume: unknown): string {
  const safeVolume = toFiniteNumber(volume);
  if (safeVolume >= 1e9) {
    return `${formatNumber(safeVolume / 1e9, 2)}B`;
  }
  if (safeVolume >= 1e6) {
    return `${formatNumber(safeVolume / 1e6, 2)}M`;
  }
  if (safeVolume >= 1e3) {
    return `${formatNumber(safeVolume / 1e3, 2)}K`;
  }
  return formatNumber(safeVolume, 2);
}

export function normalizeMarketId(value: unknown): string {
  return String(value || '').replace(/[-_/]/g, '').toLowerCase();
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
