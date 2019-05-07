import { BooleanCancellable } from 'rx-cancellable';
import Observable from '../../observable';
import { cleanObserver } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const cleaned = cleanObserver(observer);

  const {
    source, cached, observers, subscribed, cache, size, error,
  } = this;

  if (!cached) {
    const { length } = observers;
    observers[length] = cleaned;

    const controller = new BooleanCancellable();

    controller.addEventListener('cancel', () => {
      observers.splice(length, 1);
    });

    cleaned.onSubscribe(controller);

    if (!subscribed) {
      source.subscribeWith({
        onSubscribe() {
          // not applicable
        },
        onNext: (x) => {
          cache.push(x);

          if (size < cache.length) {
            cache.shift();
          }

          // eslint-disable-next-line no-restricted-syntax
          for (const obs of observers) {
            obs.onNext(x);
          }
        },
        onComplete: () => {
          this.cached = true;

          // eslint-disable-next-line no-restricted-syntax
          for (const obs of observers) {
            obs.onComplete();
          }
          controller.cancel();
          this.observers = undefined;
        },
        onError: (x) => {
          this.cached = true;
          this.error = x;

          // eslint-disable-next-line no-restricted-syntax
          for (const obs of observers) {
            obs.onError(x);
          }
          this.observers = undefined;
        },
      });
      this.subscribed = true;
    } else {
      for (let i = 0; i < cache.length; i += 1) {
        if (controller.cancelled) {
          return;
        }
        cleaned.onNext(cache[i]);
      }
    }
  } else {
    const controller = new BooleanCancellable();
    cleaned.onSubscribe(controller);

    for (let i = 0; i < cache.length; i += 1) {
      if (controller.cancelled) {
        return;
      }
      cleaned.onNext(cache[i]);
    }

    if (error) {
      cleaned.onError(error);
    } else {
      cleaned.onComplete();
    }
    controller.cancel();
  }
}

/**
 * @ignore
 */
export default (source, size) => {
  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.cached = false;
  observable.cache = [];
  observable.subscribed = false;
  observable.observers = [];
  observable.size = size;
  return observable;
};
