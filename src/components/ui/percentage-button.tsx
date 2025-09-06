import React from 'react';

interface PercentageButtonProps {
  percentage: number;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  active?: boolean;
}

export const PercentageButton: React.FC<PercentageButtonProps> = ({
  percentage,
  onClick,
  className = '',
  disabled = false,
  active = false
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        px-3 py-1 text-sm font-medium rounded-md transition-colors
        ${active 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {percentage}%
    </button>
  );
};
