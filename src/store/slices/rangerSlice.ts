import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RangerState {
  connected: boolean;
  connecting: boolean;
  subscriptions: string[];
  lastMessage: any;
  error: string | null;
}

const initialState: RangerState = {
  connected: false,
  connecting: false,
  subscriptions: [],
  lastMessage: null,
  error: null,
};

const rangerSlice = createSlice({
  name: 'ranger',
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
      state.connecting = false;
      if (!action.payload) {
        state.error = null;
      }
    },
    setConnecting: (state, action: PayloadAction<boolean>) => {
      state.connecting = action.payload;
    },
    addSubscription: (state, action: PayloadAction<string>) => {
      if (!state.subscriptions.includes(action.payload)) {
        state.subscriptions.push(action.payload);
      }
    },
    removeSubscription: (state, action: PayloadAction<string>) => {
      state.subscriptions = state.subscriptions.filter(sub => sub !== action.payload);
    },
    setLastMessage: (state, action: PayloadAction<any>) => {
      state.lastMessage = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearSubscriptions: (state) => {
      state.subscriptions = [];
    },
  },
});

export const {
  setConnected,
  setConnecting,
  addSubscription,
  removeSubscription,
  setLastMessage,
  setError,
  clearSubscriptions,
} = rangerSlice.actions;

export default rangerSlice.reducer;
