import Observable from '../../observable';
import concat from './concat';
/**
 * @ignore
 */
export default (source, other) => {
  if (!(other instanceof Observable)) {
    return source;
  }
  return concat([other, source]);
};
