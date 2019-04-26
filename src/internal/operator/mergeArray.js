import { CompositeCancellable } from 'rx-cancellable';
import { isArray, cleanObserver, immediateError } from '../utils';
import error from './error';
import Observable from '../../observable';
import is from '../is';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onSubscribe, onNext, onError, onComplete,
  } = cleanObserver(observer);

  const { sources } = this;
  const { length } = sources;

  if (length === 0) {
    immediateError(observer, new Error('Observable.mergeArray: sources is empty.'));
  } else {
    const controller = new CompositeCancellable();
    onSubscribe(controller);

    let pending = length;

    const update = () => {
      pending -= 1;
      if (pending === 0) {
        onComplete();
        controller.cancel();
      }
    };

    for (let i = 0; i < length; i += 1) {
      if (controller.cancelled) {
        return;
      }
      const source = sources[i];
      if (is(source)) {
        source.subscribeWith({
          onSubscribe(c) {
            controller.add(c);
          },
          onComplete: update,
          onError(x) {
            onError(x);
            controller.cancel();
          },
          onNext,
        });
      } else {
        onError(new Error('Observable.mergeArray: one of the sources is non-Observable.'));
        controller.cancel();
        return;
      }
    }
  }
}
/**
 * @ignore
 */
export default (sources) => {
  if (!isArray(sources)) {
    return error(new Error('Observable.mergeArray: sources is a non-Array.'));
  }
  const observable = new Observable(subscribeActual);
  observable.sources = sources;
  return observable;
};
