import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Wallet } from '@/types';

interface WalletsState {
  wallets: Wallet[];
  loading: boolean;
  error: string | null;
}

const initialState: WalletsState = {
  wallets: [],
  loading: false,
  error: null,
};

const walletsSlice = createSlice({
  name: 'wallets',
  initialState,
  reducers: {
    setWallets: (state, action: PayloadAction<Wallet[]>) => {
      state.wallets = action.payload;
    },
    updateWallet: (state, action: PayloadAction<Wallet>) => {
      const index = state.wallets.findIndex(wallet => wallet.currency === action.payload.currency);
      if (index !== -1) {
        state.wallets[index] = action.payload;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setWallets,
  updateWallet,
  setLoading,
  setError,
} = walletsSlice.actions;

export default walletsSlice.reducer;
