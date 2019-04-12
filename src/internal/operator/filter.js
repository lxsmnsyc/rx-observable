import { LinkedCancellable } from 'rx-cancellable';
import Observable from '../../observable';
import { cleanObserver, isFunction } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onSubscribe, onNext, onComplete, onError,
  } = cleanObserver(observer);

  const controller = new LinkedCancellable();

  onSubscribe(controller);

  const { source, predicate } = this;

  source.subscribeWith({
    onSubscribe(ac) {
      controller.link(ac);
    },
    onComplete,
    onError,
    onNext(x) {
      let result;

      try {
        result = predicate(x);
      } catch (e) {
        onError(e);
        controller.cancel();
        return;
      }

      if (result) {
        onNext(x);
      }
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
