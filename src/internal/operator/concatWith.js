import concatArray from './concatArray';
import is from '../is';
/**
 * @ignore
 */
export default (source, other) => (
  !is(other)
    ? source
    : concatArray([source, other])
);
