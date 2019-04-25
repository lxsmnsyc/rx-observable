import Observable from '../../observable';
import { immediateComplete, isNull } from '../utils';

/**
 * @ignore
 */
let INSTANCE;
/**
 * @ignore
 */
export default () => {
  if (isNull(INSTANCE)) {
    INSTANCE = new Observable(observer => immediateComplete(observer));
  }
  return INSTANCE;
};
