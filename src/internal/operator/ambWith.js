import amb from './amb';
import is from '../is';
/**
 * @ignore
 */
export default (source, other) => {
  if (!is(other)) {
    return source;
  }
  return amb([source, other]);
};
