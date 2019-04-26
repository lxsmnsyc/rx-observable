import { LinkedCancellable } from 'rx-cancellable';
import { cleanObserver } from '../utils';
import Observable from '../../observable';
import is from '../is';

function subscribeActual(observer) {
  const {
    onSubscribe, onNext, onError, onComplete,
  } = cleanObserver(observer);

  const controller = new LinkedCancellable();

  onSubscribe(controller);

  const { source, other } = this;

  let empty = true;

  source.subscribeWith({
    onSubscribe(ac) {
      controller.link(ac);
    },
    onComplete() {
      if (empty) {
        controller.unlink();
        other.subscribeWith({
          onSubscribe(c) {
            controller.link(c);
          },
          onComplete,
          onError,
          onNext,
        });
      } else {
        onComplete();
      }
    },
    onNext(x) {
      empty = false;
      onNext(x);
    },
    onError,
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
