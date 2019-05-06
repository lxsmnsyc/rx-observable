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

  this.source.subscribeWith({
    onSubscribe(c) {
      controller.link(c);
    },
    onComplete,
    onError,
    onNext(x) {
      onNext({
        time: Date.now(),
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
