import { call, put, takeLatest } from 'redux-saga/effects';
import { setTrades, setLoading, setError } from './slice';

function* fetchTradesSaga() {
  try {
    yield put(setLoading(true));
    // Mock API call
    const trades = yield call(() => Promise.resolve([]));
    yield put(setTrades(trades));
  } catch (error) {
    yield put(setError(error instanceof Error ? error.message : 'Unknown error'));
  } finally {
    yield put(setLoading(false));
  }
}

export function* tradesSaga() {
  yield takeLatest('trades/fetchTrades', fetchTradesSaga);
}
