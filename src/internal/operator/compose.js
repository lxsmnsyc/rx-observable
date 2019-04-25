import error from './error';
import { isFunction } from '../utils';
import is from '../is';

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

    if (!is(result)) {
      throw new Error('Observable.compose: transformer returned a non-Observable.');
    }
  } catch (e) {
    result = error(e);
  }

  return result;
};
