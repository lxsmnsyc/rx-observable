/* eslint-disable class-methods-use-this */
import Observable from '../../observable';

const SIGNAL = {
  aborted: false,
  addEventListener: () => {},
  removeEventListener: () => {},
  onabort: () => {},
};


const CONTROLLER = {
  signal: SIGNAL,
  abort: () => {},
};

/**
 * @ignore
 */
function subscribeActual(observer) {
  observer.onSubscribe(CONTROLLER);
}
/**
 * @ignore
 */
let INSTANCE;
/**
 * @ignore
 */
export default () => {
  if (typeof INSTANCE === 'undefined') {
    INSTANCE = new Observable(subscribeActual);
    INSTANCE.subscribeActual = subscribeActual.bind(INSTANCE);
  }
  return INSTANCE;
};
