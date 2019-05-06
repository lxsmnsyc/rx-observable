import { LinkedCancellable } from 'rx-cancellable';
import Observable from '../../observable';
import { cleanObserver, isFunction } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onSubscribe, onNext, onError, onComplete,
  } = cleanObserver(observer);

  const controller = new LinkedCancellable();
  onSubscribe(controller);

  const collector = new Set();

  const { source, keySelector } = this;

  source.subscribeWith({
    onSubscribe(c) {
      controller.link(c);
    },
    onComplete,
    onError,
    onNext(x) {
      let key;

      try {
        key = keySelector(x);
      } catch (e) {
        onError(e);
        controller.cancel();
        return;
      }

      if (!collector.has(key)) {
        collector.add(key);
        onNext(x);
      }
    },
  });
}
/**
 * @ignore
 */
export default (source, keySelector) => {
  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.keySelector = isFunction(keySelector) ? keySelector : x => x;
  return observable;
};
