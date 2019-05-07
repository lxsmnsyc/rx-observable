import { CompositeCancellable } from 'rx-cancellable';
import { cleanObserver } from '../utils';
import Observable from '../../observable';
import is from '../is';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onSubscribe, onNext, onError, onComplete,
  } = cleanObserver(observer);

  const controller = new CompositeCancellable();
  onSubscribe(controller);

  const { source, other } = this;

  const buffer = [];

  other.subscribeWith({
    onSubscribe(c) {
      controller.add(c);
    },
    onComplete() {
      onNext(buffer);
      onComplete();
      controller.cancel();
    },
    onError(x) {
      onError(x);
      controller.cancel();
    },
    onNext() {
      onNext(buffer.splice(0));
    },
  });

  source.subscribeWith({
    onSubscribe(c) {
      controller.add(c);
    },
    onComplete() {
      onNext(buffer);
      onComplete();
      controller.cancel();
    },
    onError(x) {
      onError(x);
      controller.cancel();
    },
    onNext(x) {
      buffer.push(x);
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
