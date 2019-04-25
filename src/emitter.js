import { Cancellable, BooleanCancellable } from 'rx-cancellable';
import { isOf, isNull } from './internal/utils';

/**
 * Abstraction over an Observer that allows associating a resource with it.
 *
 * The emitter allows the registration of a single resource, in the form of a
 * Cancellable via setCancellable(Cancellable) respectively. The emitter
 * implementations will cancel this instance when the downstream cancels
 * the flow or after the event generator logic calls ObservableEmitter.onError(Error)
 * or ObservableEmitter.onComplete() succeeds.
 *
 * Only one Cancellable object can be associated with the emitter at a time.
 * Calling either set method will cancel any previous object. If there is a need
 * for handling multiple resources, one can create a CompositeCancellable and
 * associate that with the emitter instead.
 */
// eslint-disable-next-line no-unused-vars
export default class ObservableEmitter extends Cancellable {
  constructor(next, complete, error) {
    super();
    /**
     * @ignore
     */
    this.next = next;
    /**
     * @ignore
     */
    this.complete = complete;
    /**
     * @ignore
     */
    this.error = error;
    /**
     * @ignore
     */
    this.linked = new BooleanCancellable();
  }

  /**
   * Returns true if the emitter is cancelled.
   * @returns {boolean}
   */
  get cancelled() {
    return this.linked.cancelled;
  }

  /**
   * Returns true if the emitter is cancelled successfully.
   * @returns {boolean}
   */
  cancel() {
    return this.linked.cancel();
  }

  /**
   * Set the given Cancellable as the Emitter's cancellable state.
   * @param {Cancellable} cancellable
   * The Cancellable instance
   * @returns {boolean}
   * Returns true if the cancellable is valid.
   */
  setCancellable(cancellable) {
    if (isOf(cancellable, Cancellable)) {
      if (this.cancelled) {
        cancellable.cancel();
      } else if (cancellable.cancelled) {
        this.cancel();
        return true;
      } else {
        const { linked } = this;
        this.linked = cancellable;
        linked.cancel();
        return true;
      }
    }
    return false;
  }

  /**
   * Emits a completion.
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  onComplete() {
    if (this.cancelled) {
      return;
    }
    try {
      this.complete();
    } finally {
      this.cancel();
    }
  }

  /**
   * Emits a value.
   * @param {!any} value
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  onNext(value) {
    if (this.cancelled) {
      return;
    }
    if (isNull(value)) {
      this.error(new Error('onNext called with a null value.'));
      this.cancel();
    } else {
      this.next(value);
    }
  }

  /**
   * Emits an error value.
   * @param {!Error} err
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  onError(err) {
    let report = err;
    if (!(isOf(err, Error))) {
      report = new Error('onError called with a non-Error value.');
    }
    if (this.cancelled) {
      return;
    }
    try {
      this.error(report);
    } finally {
      this.cancel();
    }
  }
}
