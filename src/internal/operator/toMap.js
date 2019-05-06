import { isFunction } from '../utils';

/**
 * @ignore
 */
export default (source, keySelector, valueSelector) => new Promise((res, rej) => {
  if (!isFunction(keySelector)) {
    rej(new Error('Observable.toMap: keySelector is not a function.'));
  }
  const result = new Map();

  let mapper = x => x;

  if (isFunction(valueSelector)) {
    mapper = valueSelector;
  }

  source.subscribe(
    x => result.set(keySelector(x), mapper(x)),
    rej,
    () => res(result),
  );
});
