import { BooleanCancellable, CompositeCancellable } from 'rx-cancellable';
import { cleanObserver } from '../utils';
import ConnectableObservable from '../../connectable-observable';

/**
 * @ignore
 */
function connectActual(consumer) {
  const { controller, observers } = this;

  if (!this.connected) {
    this.connected = true;

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
      },
    });
  }

  consumer(controller);
}
/**
 * @ignore
 */
function subscribeActual(observer) {
  const cleaned = cleanObserver(observer);

  const { observers } = this;

  observers.push(cleaned);

  const controller = new BooleanCancellable();

  controller.addEventListener('cancel', () => {
    const index = observers.indexOf(cleaned);

    if (index >= 0) {
      observers.splice(index, 1);
    }
  });

  this.controller.add(controller);

  cleaned.onSubscribe(controller);
}
/**
 * @ignore
 */
export default (source) => {
  const observable = new ConnectableObservable(subscribeActual, connectActual);
  observable.source = source;
  observable.observers = [];
  observable.connected = false;
  observable.controller = new CompositeCancellable();
  return observable;
};
