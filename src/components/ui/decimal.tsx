import React from 'react';

interface DecimalProps {
  children: number | string;
  precision?: number;
  className?: string;
  fixed?: boolean;
}

export const Decimal: React.FC<DecimalProps> = ({ 
  children, 
  precision = 8, 
  className = '',
  fixed = false 
}) => {
  const formatNumber = (value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(num)) return '0';
    
    if (fixed) {
      return num.toFixed(precision);
    }
    
    // Remove trailing zeros after decimal point
    const formatted = num.toFixed(precision);
    return formatted.replace(/\.?0+$/, '');
  };

  return (
    <span className={className}>
      {formatNumber(children)}
    </span>
  );
};
