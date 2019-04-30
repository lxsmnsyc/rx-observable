import { LinkedCancellable } from 'rx-cancellable';
import { isFunction, cleanObserver, isNull } from '../utils';
import Observable from '../../observable';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onSubscribe, onNext, onError, onComplete,
  } = cleanObserver(observer);

  const { source, scanner } = this;

  let { initial } = this;

  const controller = new LinkedCancellable();
  onSubscribe(controller);

  source.subscribeWith({
    onSubscribe(c) {
      controller.link(c);
    },
    onComplete,
    onError,
    onNext(x) {
      if (isNull(initial)) {
        initial = x;
      } else {
        initial = scanner(initial, x);
      }
      onNext(initial);
    },
  });
}

/**
 * @ignore
 */
export default (source, scanner, initial) => {
  if (!isFunction(scanner)) {
    return source;
  }
  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.scanner = scanner;
  observable.initial = initial;
  return observable;
};
