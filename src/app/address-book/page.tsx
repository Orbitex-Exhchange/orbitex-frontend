"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  Search,
  MoreHorizontal,
  ArrowRight,
  Info,
  Edit,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { useBeneficiaries } from '@/lib/api';

interface AddressBookEntry {
  id: string;
  name: string;
  currency: string;
  address: string;
  network: string;
  hasRecipientInfo: boolean;
}

export default function AddressBookPage() {
  const { data: beneficiaries, isLoading } = useBeneficiaries();
  const [searchTerm, setSearchTerm] = useState('');

  // Transform beneficiaries data to match AddressBookEntry interface
  const addresses: AddressBookEntry[] = beneficiaries ? beneficiaries.map(beneficiary => ({
    id: beneficiary.id.toString(),
    name: beneficiary.name,
    currency: beneficiary.currency,
    address: beneficiary.data?.address || '',
    network: beneficiary.currency, // Could be enhanced to show actual network
    hasRecipientInfo: beneficiary.state === 'active'
  })) : [];

  const filteredAddresses = addresses.filter(address => 
    address.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    address.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
    address.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRecipientInfo = (id: string) => {
    console.log('Add recipient info for', id);
  };

  const handleWithdraw = (id: string) => {
    console.log('Withdraw to', id);
  };

  const handleEdit = (id: string) => {
    console.log('Edit', id);
  };

  const handleDelete = (id: string) => {
    // TODO: Implement delete functionality using the API
    console.log('Delete', id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Wallet Address Book</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/address-book/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add new address
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

              <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700">
                Why do we need recipient info? We are required by law to collect certain information about your withdrawals.{' '}
                <a href="#" className="text-blue-600 hover:text-blue-800 underline">Learn more</a>
              </p>
            </div>
          </div>
        </div>

        {/* Addresses Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Currency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipient info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAddresses.map((address) => (
                  <tr key={address.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {address.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-6 w-6 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs font-medium text-gray-600">
                            {address.currency.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900">{address.currency}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">
                        {address.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {address.hasRecipientInfo ? (
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit recipient
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => handleAddRecipientInfo(address.id)}>
                          Add
                        </Button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleWithdraw(address.id)}>
                          Withdraw
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                        <div className="relative">
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                          {/* Dropdown menu would go here */}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAddresses.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {searchTerm ? 'No addresses found matching your search.' : 'No addresses in your address book yet.'}
              </div>
              {!searchTerm && (
                <Link href="/address-book/new">
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add your first address
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>

        {filteredAddresses.length > 0 && (
          <div className="text-center py-4 text-sm text-gray-500">
            No more data
          </div>
        )}
      </div>
    </div>
  );
}
