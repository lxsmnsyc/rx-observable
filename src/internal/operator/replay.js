import { BooleanCancellable, CompositeCancellable } from 'rx-cancellable';
import { cleanObserver, defaultScheduler } from '../utils';
import ConnectableObservable from '../../connectable-observable';

/**
 * @ignore
 */
function connectActual(consumer) {
  const {
    controllers, observers, cache, count,
  } = this;

  if (!this.connected) {
    this.connected = true;

    const controller = new CompositeCancellable();

    for (let i = 0; i < controllers; i += 1) {
      controller.add(controllers[i]);
    }

    consumer(controller);

    this.source.subscribeWith({
      onSubscribe(c) {
        controller.add(c);
      },
      onComplete() {
        for (let i = 0; i < observers.length; i += 1) {
          observers[i].onComplete();
        }
        controller.cancel();
      },
      onError(x) {
        for (let i = 0; i < observers.length; i += 1) {
          observers[i].onError(x);
        }
        controller.cancel();
      },
      onNext(x) {
        for (let i = 0; i < observers.length; i += 1) {
          observers[i].onNext(x);
        }
        cache.push(x);

        if (count < cache.length) {
          cache.shift();
        }
      },
    });
  }
}
/**
 * @ignore
 */
function subscribeActual(observer) {
  const cleaned = cleanObserver(observer);

  const { observers, cache, scheduler } = this;

  observers.push(cleaned);

  const controller = new BooleanCancellable();

  controller.addEventListener('cancel', () => {
    const index = observers.indexOf(cleaned);

    if (index >= 0) {
      observers.splice(index, 1);
    }
  });

  this.controllers.push(controller);

  cleaned.onSubscribe(controller);

  const { onNext } = cleaned;

  if (this.connected) {
    for (let i = 0; i < cache.length; i += 1) {
      if (controller.cancelled) {
        return;
      }
      scheduler.schedule(() => {
        onNext(cache[i]);
      });
    }
  }
}
/**
 * @ignore
 */
export default (source, count, scheduler) => {
  const observable = new ConnectableObservable(subscribeActual, connectActual);
  observable.source = source;
  observable.observers = [];
  observable.connected = false;
  observable.controllers = [];
  observable.cache = [];
  observable.count = count;
  observable.scheduler = defaultScheduler(scheduler);
  return observable;
};
