import Observable from '../../observable';
import amb from './amb';
/**
 * @ignore
 */
export default (source, other) => {
  if (!(other instanceof Observable)) {
    return source;
  }
  return amb([source, other]);
};
