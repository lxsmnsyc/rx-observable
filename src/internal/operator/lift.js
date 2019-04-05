import Observable from '../../observable';
import { isObserver, immediateError } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  let result;

  try {
    result = this.operator(observer);

    if (!isObserver(result)) {
      throw new Error('Observable.lift: operator returned a non-Observer.');
    }
  } catch (e) {
    immediateError(observer, e);
    return;
  }

  this.source.subscribeWith(result);
}

/**
 * @ignore
 */
export default (source, operator) => {
  if (typeof operator !== 'function') {
    return source;
  }

  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.operator = operator;
  return observable;
};
