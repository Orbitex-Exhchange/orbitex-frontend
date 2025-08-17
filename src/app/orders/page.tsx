"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  X, 
  Check,
  AlertTriangle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  ArrowUpDown,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { formatNumber, formatCurrency } from '@/lib/utils';

interface Order {
  id: string;
  market: string;
  side: 'buy' | 'sell';
  type: 'limit' | 'market' | 'stop' | 'stop_limit';
  amount: string;
  remaining: string;
  price: string;
  executed: string;
  avgPrice: string;
  status: 'open' | 'closed' | 'cancelled' | 'pending' | 'rejected';
  createdAt: string;
  updatedAt: string;
  trades?: Trade[];
}

interface Trade {
  id: string;
  price: string;
  amount: string;
  fee: string;
  side: 'buy' | 'sell';
  createdAt: string;
}

const mockOrders: Order[] = [
  {
    id: '1',
    market: 'SOL/USDT',
    side: 'buy',
    type: 'limit',
    amount: '50.0',
    remaining: '25.0',
    price: '98.45',
    executed: '25.0',
    avgPrice: '98.42',
    status: 'open',
    createdAt: '2024-01-20T14:22:00Z',
    updatedAt: '2024-01-20T14:25:00Z',
    trades: [
      {
        id: '1',
        price: '98.42',
        amount: '25.0',
        fee: '0.1',
        side: 'buy',
        createdAt: '2024-01-20T14:25:00Z',
      }
    ]
  },
  {
    id: '2',
    market: 'BTC/USDT',
    side: 'sell',
    type: 'limit',
    amount: '0.1',
    remaining: '0.0',
    price: '45000.00',
    executed: '0.1',
    avgPrice: '45000.00',
    status: 'closed',
    createdAt: '2024-01-19T10:15:00Z',
    updatedAt: '2024-01-19T10:20:00Z',
    trades: [
      {
        id: '2',
        price: '45000.00',
        amount: '0.1',
        fee: '0.0001',
        side: 'sell',
        createdAt: '2024-01-19T10:20:00Z',
      }
    ]
  },
  {
    id: '3',
    market: 'ETH/USDT',
    side: 'buy',
    type: 'market',
    amount: '2.0',
    remaining: '0.0',
    price: '0.00',
    executed: '2.0',
    avgPrice: '2650.50',
    status: 'closed',
    createdAt: '2024-01-18T16:30:00Z',
    updatedAt: '2024-01-18T16:30:00Z',
    trades: [
      {
        id: '3',
        price: '2650.50',
        amount: '2.0',
        fee: '0.002',
        side: 'buy',
        createdAt: '2024-01-18T16:30:00Z',
      }
    ]
  },
  {
    id: '4',
    market: 'SOL/USDT',
    side: 'sell',
    type: 'limit',
    amount: '100.0',
    remaining: '100.0',
    price: '105.00',
    executed: '0.0',
    avgPrice: '0.00',
    status: 'open',
    createdAt: '2024-01-17T09:45:00Z',
    updatedAt: '2024-01-17T09:45:00Z',
  },
  {
    id: '5',
    market: 'BTC/USDT',
    side: 'buy',
    type: 'limit',
    amount: '0.05',
    remaining: '0.0',
    price: '44000.00',
    executed: '0.0',
    avgPrice: '0.00',
    status: 'cancelled',
    createdAt: '2024-01-16T12:20:00Z',
    updatedAt: '2024-01-16T12:25:00Z',
  },
];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<'open' | 'all'>('open');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [marketFilter, setMarketFilter] = useState<string>('all');
  const [showTrades, setShowTrades] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'price' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredOrders = mockOrders.filter(order => {
    const matchesTab = activeTab === 'all' || order.status === 'open';
    const matchesSearch = order.market.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesMarket = marketFilter === 'all' || order.market === marketFilter;
    
    return matchesTab && matchesSearch && matchesStatus && matchesMarket;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
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
      case 'price':
        aValue = parseFloat(a.price);
        bValue = parseFloat(b.price);
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

  const toggleTrades = (orderId: string) => {
    setShowTrades(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const handleCancelOrder = (orderId: string) => {
    // Here you would typically make an API call to cancel the order
    console.log('Cancelling order:', orderId);
  };

  const handleCancelAllOrders = () => {
    // Here you would typically make an API call to cancel all open orders
    console.log('Cancelling all open orders');
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
      case 'open':
        return 'bg-[#00ff88] text-black';
      case 'closed':
        return 'bg-[#0088ff] text-white';
      case 'cancelled':
        return 'bg-[#888] text-white';
      case 'pending':
        return 'bg-[#ffaa00] text-black';
      case 'rejected':
        return 'bg-[#ff4444] text-white';
      default:
        return 'bg-[#333] text-white';
    }
  };

  const getSideIcon = (side: string) => {
    return side === 'buy' ? 
      <TrendingUp className="w-4 h-4 text-[#00ff88]" /> : 
      <TrendingDown className="w-4 h-4 text-[#ff4444]" />;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'limit':
        return 'text-[#00ff88]';
      case 'market':
        return 'text-[#ffaa00]';
      case 'stop':
        return 'text-[#ff4444]';
      case 'stop_limit':
        return 'text-[#0088ff]';
      default:
        return 'text-[#888]';
    }
  };

  const renderOrdersTable = () => (
    <div className="bg-[#1a1a1a] rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#0a0a0a]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#888] uppercase tracking-wider">
                Market
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#888] uppercase tracking-wider">
                Side
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#888] uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#888] uppercase tracking-wider">
                <button
                  onClick={() => handleSort('amount')}
                  className="flex items-center space-x-1 hover:text-white"
                >
                  <span>Amount</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#888] uppercase tracking-wider">
                <button
                  onClick={() => handleSort('price')}
                  className="flex items-center space-x-1 hover:text-white"
                >
                  <span>Price</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#888] uppercase tracking-wider">
                Executed
              </th>
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
            {sortedOrders.map((order) => (
              <>
                <tr key={order.id} className="hover:bg-[#0a0a0a]">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-white font-medium">{order.market}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getSideIcon(order.side)}
                      <Badge variant={order.side === 'buy' ? "default" : "outline"}
                             className={order.side === 'buy' ? "bg-[#00ff88] text-black" : "border-[#ff4444] text-[#ff4444]"}>
                        {order.side.toUpperCase()}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-medium ${getTypeColor(order.type)}`}>
                      {order.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <span className="text-white font-medium">{formatNumber(parseFloat(order.amount), 8)}</span>
                      {parseFloat(order.remaining) > 0 && (
                        <p className="text-sm text-[#888]">Remaining: {formatNumber(parseFloat(order.remaining), 8)}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <span className="text-white font-medium">
                        {order.type === 'market' ? 'Market' : formatNumber(parseFloat(order.price), 2)}
                      </span>
                      {parseFloat(order.avgPrice) > 0 && (
                        <p className="text-sm text-[#888]">Avg: {formatNumber(parseFloat(order.avgPrice), 2)}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-white font-medium">{formatNumber(parseFloat(order.executed), 8)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#888]">
                    {new Date(order.createdAt).toLocaleDateString()}
                    <br />
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      {order.status === 'open' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelOrder(order.id)}
                          className="border-[#ff4444] text-[#ff4444] hover:bg-[#ff4444] hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                      {order.trades && order.trades.length > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleTrades(order.id)}
                          className="border-[#333] text-white hover:bg-[#333]"
                        >
                          {showTrades[order.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(order.id)}
                        className="border-[#333] text-white hover:bg-[#333]"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
                {showTrades[order.id] && order.trades && order.trades.length > 0 && (
                  <tr className="bg-[#0a0a0a]">
                    <td colSpan={9} className="px-6 py-4">
                      <div className="bg-[#1a1a1a] rounded-lg p-4">
                        <h4 className="text-white font-medium mb-3">Trades</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-[#888]">
                                <th className="text-left py-2">Price</th>
                                <th className="text-left py-2">Amount</th>
                                <th className="text-left py-2">Fee</th>
                                <th className="text-left py-2">Time</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#333]">
                              {order.trades.map((trade) => (
                                <tr key={trade.id}>
                                  <td className="py-2 text-white">{formatNumber(parseFloat(trade.price), 2)}</td>
                                  <td className="py-2 text-white">{formatNumber(parseFloat(trade.amount), 8)}</td>
                                  <td className="py-2 text-[#888]">{formatNumber(parseFloat(trade.fee), 8)}</td>
                                  <td className="py-2 text-[#888]">{new Date(trade.createdAt).toLocaleTimeString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
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
              <h1 className="text-2xl font-bold text-white">Orders</h1>
              <p className="text-[#888] mt-1">Manage your open and closed orders</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" className="border-[#333] text-white hover:bg-[#333]">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" className="border-[#333] text-white hover:bg-[#333]">
                <Download className="w-4 h-4 mr-2" />
                Export
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
            { id: 'open', label: 'Open Orders', icon: Clock },
            { id: 'all', label: 'All Orders', icon: Clock },
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

        {/* Cancel All Button */}
        {activeTab === 'open' && filteredOrders.some(order => order.status === 'open') && (
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={handleCancelAllOrders}
              className="border-[#ff4444] text-[#ff4444] hover:bg-[#ff4444] hover:text-white"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel All Open Orders
            </Button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-[#1a1a1a] rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#888] w-4 h-4" />
                <Input
                  placeholder="Search by market or order ID..."
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
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={marketFilter}
                onChange={(e) => setMarketFilter(e.target.value)}
                className="bg-[#0a0a0a] border border-[#333] text-white rounded-md px-3 py-2"
              >
                <option value="all">All Markets</option>
                <option value="SOL/USDT">SOL/USDT</option>
                <option value="BTC/USDT">BTC/USDT</option>
                <option value="ETH/USDT">ETH/USDT</option>
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
            Showing {sortedOrders.length} of {mockOrders.length} orders
          </p>
        </div>

        {/* Table */}
        {sortedOrders.length > 0 ? (
          renderOrdersTable()
        ) : (
          <div className="bg-[#1a1a1a] rounded-lg p-12 text-center">
            <Clock className="w-12 h-12 text-[#888] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No orders found</h3>
            <p className="text-[#888]">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
