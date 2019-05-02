import { BooleanCancellable } from 'rx-cancellable';
import Observable from '../../observable';
import { cleanObserver } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const cleaned = cleanObserver(observer);

  const {
    source, cached, observers, subscribed, cache,
  } = this;

  if (!cached) {
    const { length } = observers;
    observers[length] = observer;

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
          cache.push({ type: 'next', value: x });

          // eslint-disable-next-line no-restricted-syntax
          for (const obs of observers) {
            obs.onNext(x);
          }
        },
        onComplete: () => {
          this.cached = true;
          cache.push({ type: 'complete' });

          // eslint-disable-next-line no-restricted-syntax
          for (const obs of observers) {
            obs.onComplete();
          }
          controller.cancel();
          this.observers = undefined;
        },
        onError: (x) => {
          this.cached = true;
          cache.push({ type: 'error', value: x });

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
        cleaned.onNext(cache[i].value);
      }
    }
  } else {
    const controller = new BooleanCancellable();
    cleaned.onSubscribe(controller);

    for (let i = 0; i < cache.length; i += 1) {
      if (controller.cancelled) {
        return;
      }
      const signal = cache[i];
      switch (signal.type) {
        case 'next':
          cleaned.onNext(signal.value);
          break;
        case 'error':
          cleaned.onError(signal.value);
          controller.cancel();
          break;
        case 'complete':
          cleaned.onComplete();
          controller.cancel();
          break;
        default:
          break;
      }
    }
  }
}

/**
 * @ignore
 */
export default (source) => {
  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.cached = false;
  observable.cache = [];
  observable.subscribed = false;
  observable.observers = [];
  return observable;
};
