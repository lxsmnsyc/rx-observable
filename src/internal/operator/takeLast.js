import { LinkedCancellable } from 'rx-cancellable';
import Observable from '../../observable';
import { isNumber, cleanObserver } from '../utils';


/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onSubscribe, onNext, onError, onComplete,
  } = cleanObserver(observer);

  const controller = new LinkedCancellable();

  onSubscribe(controller);

  const { signal } = controller;

  if (signal.aborted) {
    return;
  }

  const { source, amount } = this;

  const buffer = [];

  source.subscribeWith({
    onSubscribe(ac) {
      controller.link(ac);
    },
    onComplete() {
      // eslint-disable-next-line no-restricted-syntax
      for (const i of buffer) {
        onNext(i);
      }
      onComplete();
      controller.cancel();
    },
    onError,
    onNext(x) {
      buffer.push(x);
      if (buffer.length > amount) {
        buffer.shift();
      }
    },
  });
}

/**
 * @ignore
 */
export default (source, amount) => {
  if (!isNumber(amount)) {
    return source;
  }
  const observable = new Observable(subscribeActual);
  observable.amount = amount;
  observable.source = source;
  return observable;
};
