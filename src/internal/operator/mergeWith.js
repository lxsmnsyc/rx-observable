import is from '../is';
import mergeArray from './mergeArray';
/**
 * @ignore
 */
export default (source, other) => (
  !is(other)
    ? source
    : mergeArray([source, other])
);
