import is from '../is';
import ambArray from './ambArray';
/**
 * @ignore
 */
export default (source, other) => (
  !is(other)
    ? source
    : ambArray([source, other])
);
