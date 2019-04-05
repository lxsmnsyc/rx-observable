import AbortController from 'abort-controller';
import Observable from '../../observable';
import { cleanObserver, isFunction } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onSubscribe, onNext, onComplete, onError,
  } = cleanObserver(observer);

  const controller = new AbortController();

  onSubscribe(controller);

  const { signal } = controller;

  if (signal.aborted) {
    return;
  }

  const { source, predicate } = this;

  source.subscribeWith({
    onSubscribe(ac) {
      signal.addEventListener('abort', () => ac.abort());
    },
    onComplete() {
      onComplete();
      controller.abort();
    },
    onNext(x) {
      let result;

      try {
        result = predicate(x);
      } catch (e) {
        onError(e);
        controller.abort();
        return;
      }

      if (result) {
        onNext(x);
      }
    },
    onError(x) {
      onError(x);
      controller.abort();
    },
  });
}

/**
 * @ignore
 */
export default (source, predicate) => {
  if (!isFunction(predicate)) {
    return source;
  }

  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.predicate = predicate;
  return observable;
};
