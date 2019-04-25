/* eslint-disable no-loop-func */
/* eslint-disable no-restricted-syntax */
import { CompositeCancellable } from 'rx-cancellable';
import Observable from '../../observable';
import { cleanObserver, isArray, immediateError } from '../utils';
import error from './error';
import is from '../is';

function subscribeActual(observer) {
  const {
    onSubscribe, onNext, onError, onComplete,
  } = cleanObserver(observer);

  const controller = new CompositeCancellable();

  onSubscribe(controller);

  const { signal } = controller;

  if (signal.aborted) {
    return;
  }

  const { sources } = this;
  const { length } = sources;

  if (length === 0) {
    immediateError(observer, new Error('Completable.concatArray: sources Array is empty.'));
  } else {
    let counter = 0;

    const parentBuffer = [];

    for (let i = 0; i < length; i += 1) {
      const source = sources[i];
      if (!is(source)) {
        onError(new Error('Observable.concatArrayEager: one of the sources is a non-Observable.'));
        controller.cancel();
        return;
      }
      const buffer = [];

      parentBuffer.push(buffer);

      source.subscribeWith({
        onSubscribe(ac) {
          controller.link(ac);
        },
        onComplete() {
          counter += 1;

          if (counter === length) {
            for (const b of parentBuffer) {
              for (const item of b) {
                onNext(item);
              }
            }
            onComplete();
          }
          controller.cancel();
        },
        onError(x) {
          onError(x);
          controller.cancel();
        },
        onNext(x) {
          buffer.push(x);
        },
      });
    }
  }
}
/**
 * @ignore
 */
export default (sources) => {
  if (!isArray(sources)) {
    return error(new Error('Observable.concatArrayEager: sources is not Array.'));
  }
  const observable = new Observable(subscribeActual);
  observable.sources = sources;
  return observable;
};
