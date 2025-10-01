"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  History, 
  Download, 
  Filter,
  Search,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Clock,
  Wallet,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { useAccountTransactions, useAccountDeposits, useAccountWithdraws, useTrades } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface HistoryEntry {
  id: string;
  type: 'deposit' | 'withdraw' | 'trade';
  currency: string;
  amount: string;
  fee: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  txid?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  confirmations?: number;
  requiredConfirmations?: number;
  market?: string;
  side?: 'buy' | 'sell';
  price?: string;
  total?: string;
}

const mockHistory: HistoryEntry[] = [
  {
    id: '1',
    type: 'deposit',
    currency: 'BTC',
    amount: '0.125',
    fee: '0.0001',
    status: 'completed',
    txid: '0x1234567890abcdef1234567890abcdef12345678',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    createdAt: '2024-01-20T14:22:00Z',
    updatedAt: '2024-01-20T14:25:00Z',
    confirmations: 6,
    requiredConfirmations: 3,
  },
  {
    id: '2',
    type: 'withdraw',
    currency: 'ETH',
    amount: '2.5',
    fee: '0.005',
    status: 'pending',
    txid: '0xabcdef1234567890abcdef1234567890abcdef12',
    address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    createdAt: '2024-01-19T10:15:00Z',
    updatedAt: '2024-01-19T10:15:00Z',
    confirmations: 2,
    requiredConfirmations: 12,
  },
  {
    id: '3',
    type: 'trade',
    currency: 'SOL',
    amount: '50.0',
    fee: '0.1',
    status: 'completed',
    market: 'SOL/USDT',
    side: 'buy',
    price: '98.45',
    total: '4922.50',
    createdAt: '2024-01-18T16:30:00Z',
    updatedAt: '2024-01-18T16:30:00Z',
  },
  {
    id: '4',
    type: 'deposit',
    currency: 'USDT',
    amount: '1000.00',
    fee: '0.00',
    status: 'completed',
    txid: '0x9876543210fedcba9876543210fedcba98765432',
    address: 'TQn9Y2khDD95J42FQtQTdwVVRZqjqkqkqk',
    createdAt: '2024-01-17T09:45:00Z',
    updatedAt: '2024-01-17T09:47:00Z',
    confirmations: 15,
    requiredConfirmations: 1,
  },
  {
    id: '5',
    type: 'withdraw',
    currency: 'BTC',
    amount: '0.05',
    fee: '0.0005',
    status: 'failed',
    txid: '0x5555555555555555555555555555555555555555',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    createdAt: '2024-01-16T12:20:00Z',
    updatedAt: '2024-01-16T12:25:00Z',
    confirmations: 0,
    requiredConfirmations: 3,
  },
];

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<'deposits' | 'withdraws' | 'trades'>('deposits');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { toast } = useToast();

  // Get real data from APIs
  const { data: deposits = [], isLoading: depositsLoading } = useAccountDeposits();
  const { data: withdraws = [], isLoading: withdrawsLoading } = useAccountWithdraws();
  const { data: trades = [], isLoading: tradesLoading } = useTrades();
  const { data: transactions = [], isLoading: transactionsLoading } = useAccountTransactions();

  // Combine all history data
  const allHistory = [
    ...deposits.map(deposit => ({
      id: deposit.txid,
      type: 'deposit' as const,
      currency: deposit.currency,
      amount: deposit.amount,
      fee: deposit.fee || '0',
      status: deposit.state === 'accepted' ? 'completed' as const : 
              deposit.state === 'pending' ? 'pending' as const : 'failed' as const,
      txid: deposit.txid,
      address: deposit.to_address,
      createdAt: deposit.created_at,
      updatedAt: deposit.updated_at,
      confirmations: deposit.confirmations,
      requiredConfirmations: 3 // Default confirmation requirement
    })),
    ...withdraws.map(withdraw => ({
      id: withdraw.txid,
      type: 'withdraw' as const,
      currency: withdraw.currency,
      amount: withdraw.amount,
      fee: withdraw.fee || '0',
      status: withdraw.state === 'accepted' ? 'completed' as const : 
              withdraw.state === 'pending' ? 'pending' as const : 'failed' as const,
      txid: withdraw.txid,
      address: withdraw.rid,
      createdAt: withdraw.created_at,
      updatedAt: withdraw.updated_at,
      confirmations: withdraw.confirmations,
      requiredConfirmations: 3 // Default confirmation requirement
    })),
    ...trades.map(trade => ({
      id: trade.id.toString(),
      type: 'trade' as const,
      currency: trade.market?.split('usdt')[0]?.toUpperCase() || 'UNKNOWN',
      amount: trade.volume,
      fee: '0', // Fee would need to be calculated
      status: 'completed' as const,
      market: trade.market,
      side: trade.side,
      price: trade.price,
      total: trade.amount,
      createdAt: trade.created_at,
      updatedAt: trade.created_at
    }))
  ];

  const filteredHistory = allHistory.filter(entry => {
    const matchesType = activeTab === 'trades' ? entry.type === 'trade' : entry.type === activeTab.slice(0, -1) as 'deposit' | 'withdraw';
    const matchesSearch = entry.currency.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         ('txid' in entry ? entry.txid?.toLowerCase().includes(searchTerm.toLowerCase()) : false) || 
                         ('address' in entry ? entry.address?.toLowerCase().includes(searchTerm.toLowerCase()) : false);
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    
    return matchesType && matchesSearch && matchesStatus;
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'amount':
        aValue = parseFloat(a.amount);
        bValue = parseFloat(b.amount);
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        return 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const toggleSecret = (entryId: string) => {
    setShowSecrets(prev => ({ ...prev, [entryId]: !prev[entryId] }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Copied to clipboard');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-[#00ff88] text-black';
      case 'pending':
        return 'bg-[#ffaa00] text-black';
      case 'failed':
        return 'bg-[#ff4444] text-white';
      case 'cancelled':
        return 'bg-[#888] text-white';
      default:
        return 'bg-[#333] text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDown className="w-4 h-4 text-[#00ff88]" />;
      case 'withdraw':
        return <ArrowUp className="w-4 h-4 text-[#ff4444]" />;
      case 'trade':
        return <TrendingUp className="w-4 h-4 text-[#00ff88]" />;
      default:
        return <Clock className="w-4 h-4 text-[#888]" />;
    }
  };

  const renderHistoryTable = () => (
    <div className="bg-[#1a1a1a] rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#0a0a0a]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#888] uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#888] uppercase tracking-wider">
                Currency
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#888] uppercase tracking-wider">
                Amount
              </th>
              {activeTab !== 'trades' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-[#888] uppercase tracking-wider">
                  Address/TXID
                </th>
              )}
              {activeTab === 'trades' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#888] uppercase tracking-wider">
                    Market
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#888] uppercase tracking-wider">
                    Side
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#888] uppercase tracking-wider">
                    Price
                  </th>
                </>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-[#888] uppercase tracking-wider">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center space-x-1 hover:text-white"
                >
                  <span>Status</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#888] uppercase tracking-wider">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center space-x-1 hover:text-white"
                >
                  <span>Date</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#888] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#333]">
            {sortedHistory.map((entry) => (
              <tr key={entry.id} className="hover:bg-[#0a0a0a]">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(entry.type)}
                    <span className="text-white capitalize">{entry.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-white font-medium">{entry.currency}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <span className="text-white font-medium">{formatNumber(parseFloat(entry.amount), 8)}</span>
                    {parseFloat(entry.fee) > 0 && (
                      <p className="text-sm text-[#888]">Fee: {formatNumber(parseFloat(entry.fee), 8)}</p>
                    )}
                  </div>
                </td>
                {activeTab !== 'trades' && (
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      {'txid' in entry && entry.txid && (
                        <div className="mb-2">
                          <p className="text-xs text-[#888] mb-1">Transaction ID</p>
                          <div className="flex items-center space-x-2">
                            <code className="text-xs text-white bg-[#0a0a0a] px-2 py-1 rounded">
                              {showSecrets[entry.id] ? entry.txid : `${entry.txid.slice(0, 8)}...${entry.txid.slice(-8)}`}
                            </code>
                            <button
                              onClick={() => toggleSecret(entry.id)}
                              className="text-[#888] hover:text-white"
                            >
                              {showSecrets[entry.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={() => copyToClipboard(entry.txid!)}
                              className="text-[#888] hover:text-white"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                      {'address' in entry && entry.address && (
                        <div>
                          <p className="text-xs text-[#888] mb-1">Address</p>
                          <div className="flex items-center space-x-2">
                            <code className="text-xs text-white bg-[#0a0a0a] px-2 py-1 rounded">
                              {showSecrets[`${entry.id}-addr`] ? entry.address : `${entry.address.slice(0, 8)}...${entry.address.slice(-8)}`}
                            </code>
                            <button
                              onClick={() => toggleSecret(`${entry.id}-addr`)}
                              className="text-[#888] hover:text-white"
                            >
                              {showSecrets[`${entry.id}-addr`] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={() => copyToClipboard(entry.address!)}
                              className="text-[#888] hover:text-white"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                )}
                {activeTab === 'trades' && entry.type === 'trade' && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-white">{entry.market}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={entry.side === 'buy' ? "default" : "outline"}
                             className={entry.side === 'buy' ? "bg-[#00ff88] text-black" : "border-[#ff4444] text-[#ff4444]"}>
                        {entry.side?.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className="text-white">{formatNumber(parseFloat(entry.price || '0'), 2)}</span>
                        {entry.total && (
                          <p className="text-sm text-[#888]">Total: {formatCurrency(parseFloat(entry.total))}</p>
                        )}
                      </div>
                    </td>
                  </>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={getStatusColor(entry.status)}>
                    {entry.status}
                  </Badge>
                  {activeTab !== 'trades' && 'confirmations' in entry && entry.confirmations !== undefined && (
                    <p className="text-xs text-[#888] mt-1">
                      {entry.confirmations}/{entry.requiredConfirmations} confirmations
                    </p>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#888]">
                  {new Date(entry.createdAt).toLocaleDateString()}
                  <br />
                  {new Date(entry.createdAt).toLocaleTimeString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center space-x-2">
                    {'txid' in entry && entry.txid && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`https://blockchain.info/tx/${entry.txid}`, '_blank')}
                        className="border-[#333] text-white hover:bg-[#333]"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#333] text-white hover:bg-[#333]"
                    >
                      Details
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-[#333] p-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Transaction History</h1>
              <p className="text-[#888] mt-1">View your deposit, withdrawal, and trading history</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" className="border-[#333] text-white hover:bg-[#333]">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 bg-[#1a1a1a] rounded-lg p-1 mb-6">
          {[
            { id: 'deposits', label: 'Deposits', icon: ArrowDown },
            { id: 'withdraws', label: 'Withdrawals', icon: ArrowUp },
            { id: 'trades', label: 'Trades', icon: TrendingUp },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'bg-[#00ff88] text-black'
                  : 'text-[#888] hover:text-white hover:bg-[#333]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-[#1a1a1a] rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#888] w-4 h-4" />
                <Input
                  placeholder="Search by currency, address, or transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#0a0a0a] border-[#333] text-white"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#0a0a0a] border border-[#333] text-white rounded-md px-3 py-2"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Button variant="outline" className="border-[#333] text-white hover:bg-[#333]">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-[#888]">
            Showing {sortedHistory.length} of {allHistory.length} transactions
          </p>
        </div>

        {/* Loading State */}
        {(depositsLoading || withdrawsLoading || tradesLoading || transactionsLoading) && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <History className="w-5 h-5 animate-spin text-[#00ff88]" />
              <span className="text-white">Loading history...</span>
            </div>
          </div>
        )}

        {/* Table */}
        {!(depositsLoading || withdrawsLoading || tradesLoading || transactionsLoading) && sortedHistory.length > 0 ? (
          renderHistoryTable()
        ) : !(depositsLoading || withdrawsLoading || tradesLoading || transactionsLoading) ? (
          <div className="bg-[#1a1a1a] rounded-lg p-12 text-center">
            <History className="w-12 h-12 text-[#888] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No transactions found</h3>
            <p className="text-[#888]">Try adjusting your search or filter criteria</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
