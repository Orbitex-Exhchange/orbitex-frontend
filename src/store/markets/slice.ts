import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Market {
  id: string;
  symbol: string;
  price: number;
  change: number;
  volume: number;
}

interface MarketsState {
  markets: Market[];
  selectedMarket: string;
  loading: boolean;
  error: string | null;
}

const initialState: MarketsState = {
  markets: [],
  selectedMarket: 'BTC/USDT',
  loading: false,
  error: null,
};

export const marketsSlice = createSlice({
  name: 'markets',
  initialState,
  reducers: {
    setMarkets: (state, action: PayloadAction<Market[]>) => {
      state.markets = action.payload;
    },
    setSelectedMarket: (state, action: PayloadAction<string>) => {
      state.selectedMarket = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setMarkets, setSelectedMarket, setLoading, setError } = marketsSlice.actions;
export const marketsReducer = marketsSlice.reducer;
