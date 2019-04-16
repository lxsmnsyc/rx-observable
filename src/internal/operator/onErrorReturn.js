import Observable from '../../observable';
import { cleanObserver, isFunction } from '../utils';

function subscribeActual(observer) {
  const {
    onNext, onComplete, onError, onSubscribe,
  } = cleanObserver(observer);

  const { source, item } = this;

  source.subscribeWith({
    onSubscribe,
    onComplete,
    onError(x) {
      let result;

      try {
        result = item(x);
      } catch (e) {
        onError([x, e]);
        return;
      }
      if (result != null) {
        onNext(result);
      }
      onComplete();
    },
    onNext,
  });
}
/**
 * @ignore
 */
export default (source, item) => {
  if (!isFunction(item)) {
    return source;
  }

  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.item = item;
  return observable;
};
