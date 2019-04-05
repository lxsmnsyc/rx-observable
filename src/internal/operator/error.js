import { toCallable, immediateError, isFunction } from '../utils';
import Observable from '../../observable';

/**
 * @ignore
 */
function subscribeActual(observer) {
  let err;

  try {
    err = this.supplier();

    if (err == null) {
      throw new Error('Observable.error: Error supplier returned a null value.');
    }
  } catch (e) {
    err = e;
  }
  immediateError(observer, err);
}
/**
 * @ignore
 */
export default (value) => {
  let report = value;

  if (!(value instanceof Error || isFunction(value))) {
    report = new Error('Observable.error received a non-Error value.');
  }

  if (!isFunction(value)) {
    report = toCallable(report);
  }
  const observable = new Observable(subscribeActual);
  observable.supplier = report;
  return observable;
};
