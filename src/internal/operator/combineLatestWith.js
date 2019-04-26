import is from '../is';
import combineLatestArray from './combineLatestArray';
/**
 * @ignore
 */
export default (source, other) => (
  !is(other)
    ? source
    : combineLatestArray([source, other])
);
