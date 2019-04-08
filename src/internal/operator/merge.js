/* eslint-disable no-loop-func */
/* eslint-disable no-restricted-syntax */
import AbortController from 'abort-controller';
import Observable from '../../observable';
import { isIterable, cleanObserver } from '../utils';
import error from './error';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onNext, onComplete, onError, onSubscribe,
  } = cleanObserver(observer);

  const controller = new AbortController();

  const { signal } = controller;

  onSubscribe(controller);

  if (signal.aborted) {
    return;
  }

  const { sources } = this;

  const controllers = [];

  signal.addEventListener('abort', () => controllers.forEach(x => x.abort()));

  let completed = sources.length;

  for (const observable of sources) {
    if (signal.aborted) {
      return;
    }
    if (observable instanceof Observable) {
      observable.subscribeWith({
        onSubscribe(ac) {
          controllers.push(ac);
        },
        onComplete() {
          completed -= 1;
          if (completed === 0) {
            onComplete();
            controller.abort();
          }
        },
        onError(x) {
          onError(x);
          controller.abort();
        },
        onNext,
      });
    } else {
      onError(new Error('Observable.merge: One of the sources is a non-Observable.'));
      controller.abort();
      break;
    }
  }
}
/**
 * @ignore
 */
export default (sources) => {
  if (!isIterable(sources)) {
    return error(new Error('Observable.merge: sources is not Iterable.'));
  }
  const observable = new Observable(subscribeActual);
  observable.sources = sources;
  return observable;
};
