import Observable from '../../observable';
import merge from './merge';
/**
 * @ignore
 */
export default (source, other) => {
  if (!(other instanceof Observable)) {
    return source;
  }
  return merge([source, other]);
};
