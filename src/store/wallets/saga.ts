import { call, put, takeLatest } from 'redux-saga/effects';
import { setWallets, setLoading, setError } from './slice';

function* fetchWalletsSaga() {
  try {
    yield put(setLoading(true));
    // Mock API call
    const wallets = yield call(() => Promise.resolve([
      { currency: 'USDT', balance: 12500.50, available: 12000.00, locked: 500.50 },
      { currency: 'BTC', balance: 0.25, available: 0.20, locked: 0.05 },
    ]));
    yield put(setWallets(wallets));
  } catch (error) {
    yield put(setError(error instanceof Error ? error.message : 'Unknown error'));
  } finally {
    yield put(setLoading(false));
  }
}

export function* walletsSaga() {
  yield takeLatest('wallets/fetchWallets', fetchWalletsSaga);
}
