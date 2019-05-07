import { LinkedCancellable } from 'rx-cancellable';
import { isFunction, cleanObserver } from '../utils';
import Observable from '../../observable';
import is from '../is';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onNext, onComplete, onError, onSubscribe,
  } = cleanObserver(observer);

  const controller = new LinkedCancellable();
  onSubscribe(controller);

  const { source, mapper } = this;

  let origin;
  let currentStream;

  source.subscribeWith({
    onSubscribe(c) {
      controller.link(c);
      origin = c;
    },
    onNext(x) {
      let result;
      try {
        result = mapper(x);
        if (!is(result)) {
          throw new Error('Observable.switchMap: mapper function returned a non-Observable.');
        }
      } catch (e) {
        onError(e);
        controller.cancel();
        return;
      }
      controller.unlink();
      if (currentStream) {
        currentStream.cancel();
      }
      result.subscribeWith({
        onSubscribe(c) {
          controller.link(c);
          currentStream = c;
        },
        onComplete() {
          currentStream = null;
          if (origin.cancelled) {
            onComplete();
          } else {
            controller.link(origin);
          }
        },
        onError,
        onNext,
      });
    },
    onComplete() {
      if (!currentStream) {
        onComplete();
      }
    },
    onError,
  });
}
/**
 * @ignore
 */
export default (source, mapper) => {
  if (!isFunction(mapper)) {
    return source;
  }
  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.mapper = mapper;
  return observable;
};
