import AbortController from 'abort-controller';
import Observable from '../../observable';
import { isNumber, cleanObserver } from '../utils';


function subscribeActual(observer) {
  const {
    onSubscribe, onNext, onError, onComplete,
  } = cleanObserver(observer);

  const controller = new AbortController();

  onSubscribe(controller);

  const { signal } = controller;

  if (signal.aborted) {
    return;
  }

  const { source, amount } = this;

  const buffer = [];

  source.subscribeWith({
    onSubscribe(ac) {
      signal.addEventListener('abort', () => ac.abort());
    },
    onComplete() {
      // eslint-disable-next-line no-restricted-syntax
      for (const i of buffer) {
        onNext(i);
      }
      onComplete();
      controller.abort();
    },
    onError(x) {
      onError(x);
      controller.abort();
    },
    onNext(x) {
      buffer.push(x);
      if (buffer.length > amount) {
        buffer.shift();
      }
    },
  });
}

export default (source, amount) => {
  if (!isNumber(amount)) {
    return source;
  }
  const observable = new Observable(subscribeActual);
  observable.amount = amount;
  observable.source = source;
  return observable;
};
