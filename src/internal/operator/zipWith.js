import is from '../is';
import zipArray from './zipArray';
/**
 * @ignore
 */
export default (source, other) => (
  !is(other)
    ? source
    : zipArray([source, other])
);
