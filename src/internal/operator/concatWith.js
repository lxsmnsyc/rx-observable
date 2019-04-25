import concatArray from './concatArray';
import is from '../is';
/**
 * @ignore
 */
export default (source, other) => {
  if (!is(other)) {
    return source;
  }
  return concatArray([source, other]);
};
