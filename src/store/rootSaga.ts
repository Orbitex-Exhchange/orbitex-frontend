import { all } from 'redux-saga/effects';
import { userSaga } from './user/saga';
import { marketsSaga } from './markets/saga';
import { walletsSaga } from './wallets/saga';
import { ordersSaga } from './orders/saga';
import { tradesSaga } from './trades/saga';

export function* rootSaga() {
  yield all([
    userSaga(),
    marketsSaga(),
    walletsSaga(),
    ordersSaga(),
    tradesSaga(),
  ]);
}
