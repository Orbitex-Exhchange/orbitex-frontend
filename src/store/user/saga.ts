import { call, put, takeLatest } from 'redux-saga/effects';
import { setUser, setLoading, setError } from './slice';

function* fetchUserSaga() {
  try {
    yield put(setLoading(true));
    // Mock API call
    const user = yield call(() => Promise.resolve({ id: 1, name: 'Test User' }));
    yield put(setUser(user));
  } catch (error) {
    yield put(setError(error instanceof Error ? error.message : 'Unknown error'));
  } finally {
    yield put(setLoading(false));
  }
}

export function* userSaga() {
  yield takeLatest('user/fetchUser', fetchUserSaga);
}
