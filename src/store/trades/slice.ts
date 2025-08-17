import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Trade {
  id: string;
  market: string;
  price: number;
  amount: number;
  side: 'buy' | 'sell';
  timestamp: string;
}

interface TradesState {
  trades: Trade[];
  loading: boolean;
  error: string | null;
}

const initialState: TradesState = {
  trades: [],
  loading: false,
  error: null,
};

export const tradesSlice = createSlice({
  name: 'trades',
  initialState,
  reducers: {
    setTrades: (state, action: PayloadAction<Trade[]>) => {
      state.trades = action.payload;
    },
    addTrade: (state, action: PayloadAction<Trade>) => {
      state.trades.unshift(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setTrades, addTrade, setLoading, setError } = tradesSlice.actions;
export const tradesReducer = tradesSlice.reducer;
