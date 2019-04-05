import Observable from '../../observable';
import { immediateError, cleanObserver } from '../utils';

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
    if (!(result instanceof Observable)) {
      throw new Error('Observable.defer: supplier returned a non-Observable.');
    }
  } catch (e) {
    err = e;
  }

  if (err != null) {
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
