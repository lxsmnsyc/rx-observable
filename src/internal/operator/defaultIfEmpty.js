import { LinkedCancellable } from 'rx-cancellable';
import { cleanObserver, isNull } from '../utils';
import Observable from '../../observable';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onSubscribe, onNext, onError, onComplete,
  } = cleanObserver(observer);

  const controller = new LinkedCancellable();

  onSubscribe(controller);

  const { source, value } = this;

  let empty = true;

  source.subscribeWith({
    onSubscribe(ac) {
      controller.link(ac);
    },
    onComplete() {
      if (empty) {
        onNext(value);
      }
      onComplete();
    },
    onNext(x) {
      empty = false;
      onNext(x);
    },
    onError,
  });
}

/**
 * @ignore
 */
export default (source, value) => {
  if (isNull(value)) {
    return source;
  }

  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.value = value;

  return observable;
};
