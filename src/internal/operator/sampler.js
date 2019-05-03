import { CompositeCancellable } from 'rx-cancellable';
import is from '../is';
import Observable from '../../observable';
import { cleanObserver, exists } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onSubscribe, onNext, onError, onComplete,
  } = cleanObserver(observer);

  const { source, sampler, emitLast } = this;

  const controller = new CompositeCancellable();
  onSubscribe(controller);

  let last;

  source.subscribeWith({
    onSubscribe(c) {
      controller.add(c);
      sampler.subscribeWith({
        onSubscribe(ac) {
          controller.add(ac);
        },
        onComplete() {
          if (emitLast && exists(last)) {
            onNext(last);
          }
          onComplete();
          controller.cancel();
        },
        onError(x) {
          onError(x);
          controller.cancel();
        },
        onNext() {
          if (exists(last)) {
            onNext(last);
            last = null;
          }
        },
      });
    },
    onComplete() {
      if (emitLast && exists(last)) {
        onNext(last);
      }
      onComplete();
      controller.cancel();
    },
    onError(x) {
      onError(x);
      controller.cancel();
    },
    onNext(x) {
      last = x;
    },
  });
}

/**
 * @ignore
 */
export default (source, sampler, emitLast) => {
  if (!is(sampler)) {
    return source;
  }
  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.sampler = sampler;
  observable.emitLast = emitLast;
  return observable;
};
