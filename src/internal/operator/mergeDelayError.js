/* eslint-disable no-loop-func */
/* eslint-disable no-restricted-syntax */
import { CompositeCancellable } from 'rx-cancellable';
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

  const controller = new CompositeCancellable();

  onSubscribe(controller);

  const { sources } = this;
  let completed = sources.length;

  const errors = [];

  for (const observable of sources) {
    if (observable instanceof Observable) {
      observable.subscribeWith({
        onSubscribe(ac) {
          controller.add(ac);
        },
        onComplete() {
          completed -= 1;
          if (completed === 0) {
            if (errors.length === 0) {
              onComplete();
            } else {
              onError(errors);
            }
            controller.cancel();
          }
        },
        onError(x) {
          errors.push(x);
          completed -= 1;
          if (completed === 0) {
            onError(errors);
            controller.cancel();
          }
        },
        onNext,
      });
    } else {
      onError(new Error('Observable.mergeDelayError: One of the sources is a non-Observable.'));
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
    return error(new Error('Observable.mergeDelayError: sources is not Iterable.'));
  }
  const observable = new Observable(subscribeActual);
  observable.sources = sources;
  return observable;
};
