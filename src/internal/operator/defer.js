import Observable from '../../observable';
import { immediateError, cleanObserver, exists } from '../utils';
import is from '../is';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onNext, onComplete, onError, onSubscribe,
  } = cleanObserver(observer);

  let result;

  let err;
  try {
    result = this.supplier();
    if (!is(result)) {
      throw new Error('Observable.defer: supplier returned a non-Observable.');
    }
  } catch (e) {
    err = e;
  }

  if (exists(err)) {
    immediateError(observer, err);
  } else {
    result.subscribeWith({
      onSubscribe,
      onComplete,
      onError,
      onNext,
    });
  }
}
/**
 * @ignore
 */
export default (supplier) => {
  const observable = new Observable(subscribeActual);
  observable.supplier = supplier;
  return observable;
};
