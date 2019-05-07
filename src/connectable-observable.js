import Observable from './observable';
import { isFunction } from './internal/utils';
import { autoConnect, refCount } from './internal/operators';

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

  /**
   * Instructs the ConnectableObservable to begin emitting the items from its underlying
   * Observable to its Observers.
   * @param {function(c: Cancellable)} consumer
   * the callback Consumer that will receive the Cancellable subscription
   * representing the established connection.
   */
  connectWith(consumer) {
    if (isFunction(consumer)) {
      this.connectActual(consumer);
    }
  }

  /**
   * Instructs the ConnectableObservable to begin emitting the items from its underlying
   * Observable to its Observers.
   * @returns {Cancellable}
   * the subscription representing the connection
   */
  connect() {
    let cancellable;

    this.connectActual((c) => {
      cancellable = c;
    });

    return cancellable;
  }

  /**
   * Connects to the upstream ConnectableObservable if the number of subscribed
   * subscriber reaches the specified count and disconnect after the specified
   * timeout if all subscribers have unsubscribed.
   *
   * @param {number} subscribers
   * the number of subscribers required to connect to the upstream
   *
   * Default is 1 subscriber
   * @param {number} timeout
   * the time to wait before disconnecting after all subscribers unsubscribed
   *
   * Default is 0.
   * @param {Scheduler} scheduler
   * the target scheduler to wait on before disconnecting
   *
   * Default is Scheduler.current
   *
   * @returns {Observable}
   */
  refCount(subscribers, timeout, scheduler) {
    return refCount(this, subscribers, timeout, scheduler);
  }

  /**
   * Returns an Observable that automatically connects (at most once) to this ConnectableObservable
   * when the specified number of Subscribers subscribe to it and calls the
   * specified callback with the Subscription associated with the established connection.
   *
   * The connection happens after the given number of subscriptions and happens at most once
   * during the lifetime of the returned Observable. If this ConnectableObservable
   * terminates, the connection is never renewed, no matter how Observers come
   * and go. Use refCount() to renew a connection or dispose an active
   * connection when all Observers have cancelled their Cancellables.
   * @param {?number} subscribers
   * the number of subscribers to await before calling connect
   * on the ConnectableObservable. A non-positive value indicates
   * an immediate connection.
   *
   * Default number of subscribers required is 1.
   * @param {function(c: Cancellable)} connection
   * the callback Consumer that will receive the Cancellable subscription
   * representing the established connection.
   * @returns {Observable}
   * an Observable that automatically connects to this ConnectableObservable
   * when the specified number of subscribers subscribe to it and calls the
   * specified callback with the Cancellable subscription associated with
   * the established connection.
   */
  autoConnect(subscribers, connection) {
    return autoConnect(this, subscribers, connection);
  }
}
