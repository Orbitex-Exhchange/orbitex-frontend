import { call, put, takeLatest } from 'redux-saga/effects';
import { setOrders, setLoading, setError } from './slice';

function* fetchOrdersSaga() {
  try {
    yield put(setLoading(true));
    // Mock API call
    const orders = yield call(() => Promise.resolve([]));
    yield put(setOrders(orders));
  } catch (error) {
    yield put(setError(error instanceof Error ? error.message : 'Unknown error'));
  } finally {
    yield put(setLoading(false));
  }
}

export function* ordersSaga() {
  yield takeLatest('orders/fetchOrders', fetchOrdersSaga);
}
