import { CompositeCancellable } from 'rx-cancellable';
import { cleanObserver } from '../utils';
import Observable from '../../observable';
import is from '../is';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onNext, onComplete, onError, onSubscribe,
  } = cleanObserver(observer);

  const controller = new CompositeCancellable();
  onSubscribe(controller);

  const { source } = this;

  let pending = 0;
  let requestDone;

  source.subscribeWith({
    onSubscribe(c) {
      controller.add(c);
    },
    onNext(x) {
      if (is(x)) {
        pending += 1;
        x.subscribeWith({
          onSubscribe(c) {
            controller.add(c);
          },
          onComplete() {
            pending -= 1;

            if (pending === 0 && requestDone) {
              onComplete();
              controller.cancel();
            }
          },
          onError(e) {
            onError(e);
            controller.cancel();
          },
          onNext,
        });
      } else {
        onError(new Error('Observable.flatten: onNext called with a non-Observable'));
        controller.cancel();
      }
    },
    onComplete() {
      if (pending === 0) {
        onComplete();
        controller.cancel();
      } else {
        requestDone = true;
      }
    },
    onError(x) {
      onError(x);
      controller.cancel();
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
