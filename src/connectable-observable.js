import Observable from './observable';
import { isFunction } from './internal/utils';

/**
 * A ConnectableObservable resembles an ordinary Observable,
 * except that it does not begin emitting items when it is
 * subscribed to, but only when its connect method is called.
 * In this way you can wait for all intended Observers
 * to subscribe to the Observable before the Observable
 * begins emitting items.
 */
export default class ConnectableObservable extends Observable {
  constructor(subscribeActual, connectActual) {
    super(subscribeActual);

    this.connectActual = connectActual;
  }

  connectWith(consumer) {
    if (isFunction(consumer)) {
      this.connectActual(consumer);
    }
  }

  connect() {
    let cancellable;

    this.connectActual((c) => {
      cancellable = c;
    });

    return cancellable;
  }
}
