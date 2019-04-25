import Observable from '../../observable';
import concatArray from './concatArray';
/**
 * @ignore
 */
export default (source, other) => {
  if (!(other instanceof Observable)) {
    return source;
  }
  return concatArray([source, other]);
};
