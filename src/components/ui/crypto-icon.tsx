import React from 'react';

interface CryptoIconProps {
  code: string;
  className?: string;
  size?: number;
}

// Simple crypto icon component that displays the currency code
// In a real implementation, you would use actual crypto icons
export const CryptoIcon: React.FC<CryptoIconProps> = ({ 
  code, 
  className = '', 
  size = 24 
}) => {
  return (
    <div 
      className={`flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-semibold ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(8, size * 0.4) }}
    >
      {code.slice(0, 2).toUpperCase()}
    </div>
  );
};
