/* eslint-disable no-restricted-syntax */
import AbortController from 'abort-controller';
import Observable from '../../observable';
import { cleanObserver, isIterable } from '../utils';
import error from './error';

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

  const { sources } = this;
  const { length } = sources;
  let counter = 0;

  const sub = () => {
    const source = sources[counter];
    if (!(source instanceof Observable)) {
      onError(new Error('Observable.concat: one of the sources is a non-Observable.'));
      controller.abort();
    }
    counter += 1;
    source.subscribeWith({
      onSubscribe(ac) {
        signal.addEventListener('abort', () => ac.abort());
      },
      onComplete() {
        if (counter === length) {
          onComplete();
          controller.abort();
        } else {
          sub();
        }
      },
      onError(x) {
        onError(x);
        controller.abort();
      },
      onNext,
    });
  };

  sub();
}
/**
 * @ignore
 */
export default (sources) => {
  if (!isIterable(sources)) {
    return error(new Error('Observable.concat: sources is not Iterable.'));
  }
  const observable = new Observable(subscribeActual);
  observable.sources = sources;
  return observable;
};