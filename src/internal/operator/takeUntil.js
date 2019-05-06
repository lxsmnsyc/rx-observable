import { CompositeCancellable } from 'rx-cancellable';
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

  other.subscribeWith({
    onSubscribe(ac) {
      controller.add(ac);
    },
    onComplete() {
      onError(new Error('Observable.takeUntil: Source cancelled by other Observable.'));
      controller.cancel();
    },
    onError(x) {
      onError(new Error(['Observable.takeUntil: Source cancelled by other Observable.', x]));
      controller.cancel();
    },
    onNext() {
      onError(new Error('Observable.takeUntil: Source cancelled by other Observable.'));
      controller.cancel();
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
    onNext,
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
