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

  source.subscribeWith({
    onSubscribe,
    onComplete() {
      callable();
      onComplete();
    },
    onError(x) {
      callable();
      onError(x);
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
