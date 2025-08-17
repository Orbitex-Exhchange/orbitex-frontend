import { call, put, takeLatest } from 'redux-saga/effects';
import { setMarkets, setLoading, setError } from './slice';

function* fetchMarketsSaga() {
  try {
    yield put(setLoading(true));
    // Mock API call
    const markets = yield call(() => Promise.resolve([
      { id: '1', symbol: 'BTC/USDT', price: 43250.50, change: 2.45, volume: 1234567 },
      { id: '2', symbol: 'ETH/USDT', price: 2650.25, change: -1.23, volume: 987654 },
    ]));
    yield put(setMarkets(markets));
  } catch (error) {
    yield put(setError(error instanceof Error ? error.message : 'Unknown error'));
  } finally {
    yield put(setLoading(false));
  }
}

export function* marketsSaga() {
  yield takeLatest('markets/fetchMarkets', fetchMarketsSaga);
}
