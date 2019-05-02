import { CompositeCancellable } from 'rx-cancellable';
import { cleanObserver, isFunction } from '../utils';
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

  const { source, mapper } = this;

  let pending = 0;
  let requestDone;

  source.subscribeWith({
    onSubscribe(c) {
      controller.add(c);
    },
    onNext(x) {
      let result;

      try {
        result = mapper(x);

        if (!is(result)) {
          throw new Error('Observable.flatMap: mapper returned a non-Observable.');
        }
      } catch (e) {
        onError(e);
        controller.cancel();
        return;
      }
      pending += 1;
      result.subscribeWith({
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
export default (source, mapper) => {
  if (!isFunction(mapper)) {
    return source;
  }
  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.mapper = mapper;
  return observable;
};
