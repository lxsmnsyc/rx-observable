import { LinkedCancellable } from 'rx-cancellable';
import Observable from '../../observable';
import { cleanObserver, isFunction, exists } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onSubscribe, onNext, onError, onComplete,
  } = cleanObserver(observer);

  const controller = new LinkedCancellable();
  onSubscribe(controller);

  let prev;

  const { source, comparer } = this;

  source.subscribeWith({
    onSubscribe(c) {
      controller.link(c);
    },
    onComplete,
    onError,
    onNext(x) {
      if (exists(prev)) {
        let result;

        try {
          result = comparer(prev, x);
        } catch (e) {
          onError(e);
          controller.cancel();
          return;
        }

        if (!result) {
          onNext(x);
        }
      } else {
        onNext(x);
      }

      prev = x;
    },
  });
}
/**
 * @ignore
 */
const defaultComparer = (x, y) => x === y;
/**
 * @ignore
 */
export default (source, comparer) => {
  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.comparer = isFunction(comparer) ? comparer : defaultComparer;
  return observable;
};
