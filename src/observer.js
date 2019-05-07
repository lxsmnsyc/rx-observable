/**
 * @interface
 * Represents an object that receives notification from
 * an Emitter.
 */
// eslint-disable-next-line no-unused-vars
export default class Observer {
  /**
   * Receives the Cancellable subscription.
   * @param {!Cancellable} d
   * @abstract
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  onSubscribe(d) {}

  /**
   * Receives a value.
   * @param {!any} value
   * @abstract
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  onNext(value) {}


  /**
   * Receives a completion
   * @abstract
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  onComplete() {}

  /**
   * Receives an error value.
   * @param {!Error} err
   * @abstract
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  onError(err) {}
}
