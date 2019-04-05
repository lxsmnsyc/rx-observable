import Observable from '../../observable';
import { cleanObserver, isFunction } from '../utils';

/**
 * @ignore
 */
const defaultMapper = x => x;

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onNext, onComplete, onError, onSubscribe,
  } = cleanObserver(observer);

  const { mapper } = this;

  this.source.subscribeWith({
    onSubscribe,
    onNext(x) {
      let result;
      try {
        result = mapper(x);
        if (result == null) {
          throw new Error('Observable.map: mapper function returned a null value.');
        }
      } catch (e) {
        onError(e);
        return;
      }
      onNext(result);
    },
    onComplete,
    onError,
  });
}
/**
 * @ignore
 */
export default (source, mapper) => {
  let ms = mapper;
  if (!isFunction(mapper)) {
    ms = defaultMapper;
  }

  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.mapper = ms;
  return observable;
};
