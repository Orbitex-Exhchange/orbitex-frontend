import * as React from 'react';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { cn, formatNumber, formatCurrency } from '../../lib/utils';

export interface WalletItem {
  currency: string;
  balance: string;
  locked: string;
  available: string;
  icon?: string;
  name?: string;
  type?: 'crypto' | 'fiat';
  deposit_enabled?: boolean;
  withdrawal_enabled?: boolean;
}

export interface WalletListProps {
  wallets: WalletItem[];
  loading?: boolean;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  filterType?: 'all' | 'crypto' | 'fiat';
  onFilterChange?: (type: 'all' | 'crypto' | 'fiat') => void;
  sortBy?: 'balance' | 'name' | 'currency';
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (sortBy: 'balance' | 'name' | 'currency', order: 'asc' | 'desc') => void;
  onWalletSelect?: (wallet: WalletItem) => void;
  selectedWallet?: WalletItem | null;
  showBalances?: boolean;
  onDeposit?: (wallet: WalletItem) => void;
  onWithdraw?: (wallet: WalletItem) => void;
  onTrade?: (wallet: WalletItem) => void;
  className?: string;
}

export const WalletList: React.FC<WalletListProps> = ({
  wallets,
  loading = false,
  searchTerm = '',
  onSearchChange,
  filterType = 'all',
  onFilterChange,
  sortBy = 'balance',
  sortOrder = 'desc',
  onSortChange,
  onWalletSelect,
  selectedWallet,
  showBalances = true,
  onDeposit,
  onWithdraw,
  onTrade,
  className,
}) => {
  const [localSearchTerm, setLocalSearchTerm] = React.useState(searchTerm);

  // Filter wallets based on search and filter
  const filteredWallets = React.useMemo(() => {
    return wallets.filter(wallet => {
      const matchesSearch = wallet.currency.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
                           wallet.name?.toLowerCase().includes(localSearchTerm.toLowerCase());
      const matchesType = filterType === 'all' || wallet.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [wallets, localSearchTerm, filterType]);

  // Sort wallets
  const sortedWallets = React.useMemo(() => {
    return [...filteredWallets].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'balance':
          aValue = parseFloat(a.balance);
          bValue = parseFloat(b.balance);
          break;
        case 'name':
          aValue = a.name || a.currency;
          bValue = b.name || b.currency;
          break;
        case 'currency':
          aValue = a.currency;
          bValue = b.currency;
          break;
        default:
          aValue = parseFloat(a.balance);
          bValue = parseFloat(b.balance);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredWallets, sortBy, sortOrder]);

  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value);
    onSearchChange?.(value);
  };

  const handleSort = (newSortBy: 'balance' | 'name' | 'currency') => {
    const newOrder = sortBy === newSortBy && sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange?.(newSortBy, newOrder);
  };

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search wallets..."
            value={localSearchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-border">
            <Button
              variant={filterType === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onFilterChange?.('all')}
            >
              All
            </Button>
            <Button
              variant={filterType === 'crypto' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onFilterChange?.('crypto')}
            >
              Crypto
            </Button>
            <Button
              variant={filterType === 'fiat' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onFilterChange?.('fiat')}
            >
              Fiat
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('balance')}
              className={cn(sortBy === 'balance' && "bg-primary text-primary-foreground")}
            >
              Balance
              {sortBy === 'balance' && (
                sortOrder === 'asc' ? <SortAsc className="h-3 w-3 ml-1" /> : <SortDesc className="h-3 w-3 ml-1" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('name')}
              className={cn(sortBy === 'name' && "bg-primary text-primary-foreground")}
            >
              Name
              {sortBy === 'name' && (
                sortOrder === 'asc' ? <SortAsc className="h-3 w-3 ml-1" /> : <SortDesc className="h-3 w-3 ml-1" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('currency')}
              className={cn(sortBy === 'currency' && "bg-primary text-primary-foreground")}
            >
              Currency
              {sortBy === 'currency' && (
                sortOrder === 'asc' ? <SortAsc className="h-3 w-3 ml-1" /> : <SortDesc className="h-3 w-3 ml-1" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Wallet List */}
      <div className="space-y-2">
        {sortedWallets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No wallets found matching your criteria.</p>
          </div>
        ) : (
          sortedWallets.map((wallet) => (
            <WalletListItem
              key={wallet.currency}
              wallet={wallet}
              isSelected={selectedWallet?.currency === wallet.currency}
              showBalances={showBalances}
              onSelect={() => onWalletSelect?.(wallet)}
              onDeposit={() => onDeposit?.(wallet)}
              onWithdraw={() => onWithdraw?.(wallet)}
              onTrade={() => onTrade?.(wallet)}
            />
          ))
        )}
      </div>

      {/* Summary */}
      <div className="text-sm text-muted-foreground text-center">
        Showing {sortedWallets.length} of {wallets.length} wallets
      </div>
    </div>
  );
};

interface WalletListItemProps {
  wallet: WalletItem;
  isSelected: boolean;
  showBalances: boolean;
  onSelect: () => void;
  onDeposit: () => void;
  onWithdraw: () => void;
  onTrade: () => void;
}

const WalletListItem: React.FC<WalletListItemProps> = ({
  wallet,
  isSelected,
  showBalances,
  onSelect,
  onDeposit,
  onWithdraw,
  onTrade,
}) => {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4 cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        {/* Wallet Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">
              {wallet.currency.charAt(0)}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{wallet.name || wallet.currency}</h3>
              <Badge variant={wallet.type === 'crypto' ? 'default' : 'secondary'} className="text-xs">
                {wallet.type === 'crypto' ? 'Crypto' : 'Fiat'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{wallet.currency}</p>
          </div>
        </div>

        {/* Balance Info */}
        <div className="text-right">
          <p className="font-medium">
            {showBalances ? formatNumber(parseFloat(wallet.balance), 8) : '****'}
          </p>
          <p className="text-xs text-muted-foreground">
            Available: {showBalances ? formatNumber(parseFloat(wallet.available), 8) : '****'}
          </p>
          {parseFloat(wallet.locked) > 0 && (
            <p className="text-xs text-muted-foreground">
              Locked: {showBalances ? formatNumber(parseFloat(wallet.locked), 8) : '****'}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDeposit();
            }}
            disabled={!wallet.deposit_enabled}
            className="h-8 px-2"
          >
            <span className="text-xs">Deposit</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onWithdraw();
            }}
            disabled={!wallet.withdrawal_enabled}
            className="h-8 px-2"
          >
            <span className="text-xs">Withdraw</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onTrade();
            }}
            className="h-8 px-2"
          >
            <span className="text-xs">Trade</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

// Legacy component for backward compatibility
export class LegacyWalletList extends React.Component<any> {
  public render() {
    return <WalletList wallets={[]} />;
  }
}
