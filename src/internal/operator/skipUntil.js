import { CompositeCancellable, LinkedCancellable } from 'rx-cancellable';
import Observable from '../../observable';
import { cleanObserver } from '../utils';
import is from '../is';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onSubscribe, onComplete, onNext, onError,
  } = cleanObserver(observer);

  const controller = new CompositeCancellable();

  onSubscribe(controller);

  const { source, other } = this;

  const otherController = new LinkedCancellable();

  controller.add(otherController);

  other.subscribeWith({
    onSubscribe(ac) {
      otherController.link(ac);
    },
    onComplete() {
    },
    onError() {
    },
    onNext() {
      otherController.cancel();
    },
  });

  source.subscribeWith({
    onSubscribe(ac) {
      controller.add(ac);
    },
    onComplete() {
      onComplete();
      controller.cancel();
    },
    onError(x) {
      onError(x);
      controller.cancel();
    },
    onNext(x) {
      if (!otherController.cancelled) {
        onNext(x);
      }
    },
  });
}

/**
 * @ignore
 */
export default (source, other) => {
  if (!is(other)) {
    return source;
  }

  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.other = other;
  return observable;
};
