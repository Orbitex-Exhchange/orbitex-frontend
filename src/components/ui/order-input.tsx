import React from 'react';
import { Input } from './input';
import { Label } from './label';

interface OrderInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number';
  className?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

export const OrderInput: React.FC<OrderInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  className = '',
  disabled = false,
  required = false,
  error
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={label.toLowerCase().replace(/\s+/g, '-')}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={label.toLowerCase().replace(/\s+/g, '-')}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={error ? 'border-red-500' : ''}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
