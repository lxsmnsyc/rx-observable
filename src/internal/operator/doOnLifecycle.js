import Observable from '../../observable';
import { cleanObserver, isFunction } from '../utils';
import doOnSubscribe from './doOnSubscribe';
import doOnCancel from './doOnCancel';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onSuccess, onError, onSubscribe,
  } = cleanObserver(observer);

  const { source, onStart, onEnd } = this;

  source.subscribeWith({
    onSubscribe(d) {
      d.addEventListener('cancel', onEnd);
      onStart(d);
      onSubscribe(d);
    },
    onSuccess,
    onError,
  });
}

/**
 * @ignore
 */
export default (source, onStart, onEnd) => {
  const IS = isFunction(onStart);
  const IE = isFunction(onEnd);
  if (IS && IE) {
    const observable = new Observable(subscribeActual);
    observable.onStart = onStart;
    observable.onEnd = onEnd;
    return observable;
  }
  if (IS) {
    return doOnSubscribe(source, onStart);
  }
  if (IE) {
    return doOnCancel(source, onEnd);
  }
  return source;
};
