import Observable from '../../observable';
import { cleanObserver, isFunction, isNull } from '../utils';

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
        if (isNull(result)) {
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
  if (!isFunction(mapper)) {
    return source;
  }
  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.mapper = mapper;
  return observable;
};
