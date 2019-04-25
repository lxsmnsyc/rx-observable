/* eslint-disable no-loop-func */
/* eslint-disable no-restricted-syntax */
import { CompositeCancellable } from 'rx-cancellable';
import Observable from '../../observable';
import { cleanObserver, isIterable } from '../utils';
import error from './error';

function subscribeActual(observer) {
  const {
    onSubscribe, onNext, onError, onComplete,
  } = cleanObserver(observer);

  const { sources } = this;
  const { length } = sources;

  const controller = new CompositeCancellable();

  onSubscribe(controller);

  let counter = 0;

  const parentBuffer = [];


  for (const source of sources) {
    if (!(source instanceof Observable)) {
      onError(new Error('Observable.concatEager: one of the sources is a non-Observable.'));
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
            for (const i of b) {
              onNext(i);
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
/**
 * @ignore
 */
export default (sources) => {
  if (!isIterable(sources)) {
    return error(new Error('Observable.concatEager: sources is not Iterable.'));
  }
  const observable = new Observable(subscribeActual);
  observable.sources = sources;
  return observable;
};
