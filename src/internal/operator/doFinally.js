import Observable from '../../observable';
import { cleanObserver, isFunction } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onNext, onComplete, onError, onSubscribe,
  } = cleanObserver(observer);

  const { source, callable } = this;

  let called = false;
  source.subscribeWith({
    onSubscribe(ac) {
      ac.addEventListener('cancel', () => {
        if (!called) {
          callable();
          called = true;
        }
      });
      onSubscribe(ac);
    },
    onComplete() {
      onComplete();
      if (!called) {
        callable();
        called = true;
      }
    },
    onError(x) {
      onError(x);
      if (!called) {
        callable();
        called = true;
      }
    },
    onNext,
  });
}

/**
 * @ignore
 */
export default (source, callable) => {
  if (!isFunction(callable)) {
    return source;
  }
  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.callable = callable;
  return observable;
};
