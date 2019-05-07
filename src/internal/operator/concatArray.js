/* eslint-disable no-restricted-syntax */
import { LinkedCancellable } from 'rx-cancellable';
import Observable from '../../observable';
import { cleanObserver, isArray, immediateError } from '../utils';
import error from './error';
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
    immediateError(observer, new Error('Completable.concatArray: sources Array is empty.'));
  } else {
    const controller = new LinkedCancellable();

    onSubscribe(controller);

    let counter = 0;

    const sub = () => {
      const source = sources[counter];
      if (!(is(source))) {
        onError(new Error('Observable.concatArray: one of the sources is a non-Observable.'));
        controller.cancel();
        return;
      }
      controller.unlink();
      counter += 1;
      source.subscribeWith({
        onSubscribe(ac) {
          controller.link(ac);
        },
        onComplete() {
          if (counter === length) {
            onComplete();
            controller.cancel();
          } else {
            sub();
          }
        },
        onError,
        onNext,
      });
    };

    sub();
  }
}
/**
 * @ignore
 */
export default (sources) => {
  if (!isArray(sources)) {
    return error(new Error('Observable.concatArray: sources is non-Array.'));
  }
  const observable = new Observable(subscribeActual);
  observable.sources = sources;
  return observable;
};
