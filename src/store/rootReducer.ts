import { combineReducers } from '@reduxjs/toolkit';
import { userReducer } from './user/slice';
import { marketsReducer } from './markets/slice';
import { walletsReducer } from './wallets/slice';
import { ordersReducer } from './orders/slice';
import { tradesReducer } from './trades/slice';
import { uiReducer } from './ui/slice';

export const rootReducer = combineReducers({
  user: userReducer,
  markets: marketsReducer,
  wallets: walletsReducer,
  orders: ordersReducer,
  trades: tradesReducer,
  ui: uiReducer,
});
