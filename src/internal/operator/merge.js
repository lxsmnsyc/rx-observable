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

  for (const observable of sources) {
    if (observable instanceof Observable) {
      observable.subscribeWith({
        onSubscribe(ac) {
          controller.add(ac);
        },
        onComplete() {
          completed -= 1;
          if (completed === 0) {
            onComplete();
            controller.cancel();
          }
        },
        onError(x) {
          onError(x);
          controller.cancel();
        },
        onNext,
      });
    } else {
      onError(new Error('Observable.merge: One of the sources is a non-Observable.'));
      controller.cancel();
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
