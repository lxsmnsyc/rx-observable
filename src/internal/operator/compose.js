import Observable from '../../observable';
import error from './error';
import { isFunction } from '../utils';

/**
 * @ignore
 */
export default (source, transformer) => {
  if (!isFunction(transformer)) {
    return source;
  }

  let result;

  try {
    result = transformer(source);

    if (!(result instanceof Observable)) {
      throw new Error('Observable.compose: transformer returned a non-Observable.');
    }
  } catch (e) {
    result = error(e);
  }

  return result;
};
