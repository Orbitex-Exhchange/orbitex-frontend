"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const currencies = [
  { value: 'ETH', label: 'Ethereum', network: 'Ethereum' },
  { value: 'BTC', label: 'Bitcoin', network: 'Bitcoin' },
  { value: 'USDT', label: 'Tether', network: 'Ethereum' },
  { value: 'USDC', label: 'USD Coin', network: 'Ethereum' },
  { value: 'SOL', label: 'Solana', network: 'Solana' },
  { value: 'BNB', label: 'Binance Coin', network: 'BSC' },
];

const networks = [
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'bitcoin', label: 'Bitcoin' },
  { value: 'solana', label: 'Solana' },
  { value: 'bsc', label: 'BSC' },
];

export default function AddNewAddressPage() {
  const [formData, setFormData] = useState({
    name: '',
    currency: '',
    address: '',
    network: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Wallet address label is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Wallet address is required';
    } else if (!isValidAddress(formData.address)) {
      newErrors.address = 'Invalid wallet address format';
    }

    if (!formData.network) {
      newErrors.network = 'Please select a network';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidAddress = (address: string) => {
    // Basic validation - in real app, you'd have more sophisticated validation
    if (formData.currency === 'ETH' || formData.currency === 'USDT' || formData.currency === 'USDC') {
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    } else if (formData.currency === 'BTC') {
      return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address);
    } else if (formData.currency === 'SOL') {
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    }
    return address.length > 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form submitted:', formData);
      // Handle form submission
    }
  };

  const isFormValid = formData.name.trim() && formData.address.trim() && formData.network;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/address-book" className="flex items-center text-gray-400 hover:text-gray-600">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to address book
              </Link>
            </div>
          </div>
        </div>
      </div>

              <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add new wallet address here</h1>
          <p className="mt-2 text-gray-600">Add a new wallet address to your address book for quick withdrawals</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Currency Field */}
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                <SelectTrigger className={errors.currency ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      <div className="flex items-center">
                        <div className="h-4 w-4 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs font-medium text-gray-600">
                            {currency.label.charAt(0)}
                          </span>
                        </div>
                        {currency.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.currency && (
                <p className="mt-1 text-sm text-red-600">{errors.currency}</p>
              )}
            </div>

            {/* Address Field */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Wallet Address
              </label>
              <Input
                id="address"
                type="text"
                placeholder="Wallet Address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            {/* Network Field */}
            <div>
              <label htmlFor="network" className="block text-sm font-medium text-gray-700 mb-2">
                Network
              </label>
              <Select value={formData.network} onValueChange={(value) => handleInputChange('network', value)}>
                <SelectTrigger className={errors.network ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  {networks.map((network) => (
                    <SelectItem key={network.value} value={network.value}>
                      {network.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.network && (
                <p className="mt-1 text-sm text-red-600">{errors.network}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link href="/address-book">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={!isFormValid}>
                Continue
              </Button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Important Information
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Make sure to double-check the wallet address before saving</li>
                  <li>Only send the specified cryptocurrency to this address</li>
                  <li>Using the wrong network may result in permanent loss of funds</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
