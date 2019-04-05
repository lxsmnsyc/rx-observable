import AbortController from 'abort-controller';
import Observable from '../../observable';
import { cleanObserver, isNumber } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onNext, onComplete, onError, onSubscribe,
  } = cleanObserver(observer);

  const { amount, doDelayError } = this;

  const controller = new AbortController();

  const { signal } = controller;

  onSubscribe(controller);

  if (signal.aborted) {
    return;
  }

  this.source.subscribeWith({
    onSubscribe(ac) {
      signal.addEventListener('abort', () => ac.abort());
    },
    onNext(x) {
      const timeout = setTimeout(() => {
        onNext(x);
      }, amount);

      signal.addEventListener('abort', () => {
        clearTimeout(timeout);
      });
    },
    onComplete() {
      const timeout = setTimeout(() => {
        onComplete();
        controller.abort();
      }, amount);

      signal.addEventListener('abort', () => {
        clearTimeout(timeout);
      });
    },
    onError(x) {
      const timeout = setTimeout(() => {
        onError(x);
        controller.abort();
      }, doDelayError ? 0 : amount);

      signal.addEventListener('abort', () => {
        clearTimeout(timeout);
      });
    },
  });
}
/**
 * @ignore
 */
export default (source, amount, doDelayError) => {
  if (!isNumber(amount)) {
    return source;
  }
  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.amount = amount;
  observable.doDelayError = doDelayError;
  return observable;
};
