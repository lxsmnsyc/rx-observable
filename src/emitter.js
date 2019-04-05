/**
 * @interface
 * Represents an object that receives notification to
 * an Observer.
 *
 * Emitter is an abstraction layer of the Observer
 */
// eslint-disable-next-line no-unused-vars
export default class Emitter extends AbortController {
  /**
   * Emits a value.
   *
   * Can be called multiple times until Emitter is aborted, has
   * emitted an Error or is completed.
   * @param {!any} value
   * @abstract
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  onSuccess(value) {}

  /**
   * Emits an error value.
   * @param {!Error} err
   * @abstract
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  onError(err) {}

  /**
   * Emits a completion
   * @abstract
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  onComplete() {}
}
