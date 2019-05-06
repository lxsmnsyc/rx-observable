import { LinkedCancellable } from 'rx-cancellable';
import Observable from '../../observable';
import { cleanObserver } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onSubscribe, onNext, onError, onComplete,
  } = cleanObserver(observer);

  const controller = new LinkedCancellable();
  onSubscribe(controller);

  let current;

  this.source.subscribeWith({
    onSubscribe(c) {
      controller.link(c);
      current = Date.now();
    },
    onComplete,
    onError,
    onNext(x) {
      const prev = current;
      current = Date.now();
      onNext({
        time: current - prev,
        value: x,
      });
    },
  });
}
/**
 * @ignore
 */
export default (source) => {
  const observable = new Observable(subscribeActual);
  observable.source = source;
  return observable;
};
