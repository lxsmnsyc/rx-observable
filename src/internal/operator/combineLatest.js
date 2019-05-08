/* eslint-disable no-restricted-syntax */
import { isIterable } from '../utils';
import error from './error';
import is from '../is';
import combineLatestArray from './combineLatestArray';

/**
 * @ignore
 */
export default (sources, combiner) => {
  if (!isIterable(sources)) {
    return error(new Error('Observable.combineLatest: sources is a non-Iterable.'));
  }
  const result = [];

  for (const source of sources) {
    if (is(source)) {
      result.push(source);
    } else {
      return error(new Error('Observable.combineLatest: one of the sources is not an Observable.'));
    }
  }

  return combineLatestArray(result, combiner);
};
