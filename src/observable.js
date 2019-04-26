import { LinkedCancellable } from 'rx-cancellable';
import { isObserver } from './internal/utils';

export default class Observable {
  /**
   * @ignore
   */
  constructor(subscribeActual) {
    this.subscribeActual = subscribeActual;
  }

  /**
   * @desc
   * Subscribes with an Object that is an Observer.
   *
   * An Object is considered as an Observer if:
   *  - if it has the method onSubscribe
   *  - if it has the method onComplete (optional)
   *  - if it has the method onNext (optional)
   *  - if it has the method onError (optional)
   *
   * The onSubscribe method is called when subscribeWith
   * or subscribe is executed. This method receives an
   * AbortController instance.
   *
   * @param {!Object} observer
   * @returns {undefined}
   */
  subscribeWith(observer) {
    if (isObserver(observer)) {
      this.subscribeActual.call(this, observer);
    }
  }

  /**
   * @desc
   * Subscribes to a Maybe instance with an onNext
   * and an onError method.
   *
   * onNext receives a non-undefined value.
   * onError receives a string(or an Error object).
   *
   * Both are called once.
   * @param {?function(x: any)} onNext
   * the function you have designed to accept the emission
   * from the Maybe
   * @param {?function(x: any)} onComplete
   * the function you have designed to accept the completion
   * from the Maybe
   * @param {?function(x: any)} onError
   * the function you have designed to accept any error
   * notification from the Maybe
   * @returns {Cancellable}
   * an Cancellable reference can request the Maybe to cancel.
   */
  subscribe(onNext, onComplete, onError) {
    const controller = new LinkedCancellable();
    this.subscribeWith({
      onSubscribe(ac) {
        controller.link(ac);
      },
      onComplete,
      onNext,
      onError,
    });
    return controller;
  }
}
