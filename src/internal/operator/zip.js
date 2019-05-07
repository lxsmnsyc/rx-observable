/* eslint-disable no-restricted-syntax */
import { isIterable } from '../utils';
import error from './error';
import is from '../is';
import zipArray from './zipArray';

/**
 * @ignore
 */
export default (sources) => {
  if (!isIterable(sources)) {
    return error(new Error('Observable.zip: sources is a non-Iterable.'));
  }
  const result = [];

  for (const source of sources) {
    if (is(source)) {
      result.push(source);
    } else {
      return error(new Error('Observable.zip: one of the sources is not an Observable.'));
    }
  }

  return zipArray(result);
};
