import Observable from '../../observable';
import { immediateComplete } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  immediateComplete(observer);
}

let INSTANCE;
/**
 * @ignore
 */
export default () => {
  if (typeof INSTANCE === 'undefined') {
    INSTANCE = new Observable(subscribeActual);
  }
  return INSTANCE;
};
