/* eslint-disable no-restricted-syntax */
import AbortController from 'abort-controller';
import Observable from '../../observable';
import { cleanObserver } from '../utils';

function subscribeActual(observer) {
  const {
    onNext, onError, onComplete, onSubscribe,
  } = cleanObserver(observer);

  const controller = new AbortController();

  const { values } = this;

  onSubscribe(controller);

  const { signal } = controller;

  for (const x of values) {
    if (signal.aborted) {
      return;
    }
    if (x == null) {
      onError(new Error('Observable.just: attempt to send null value.'));
      controller.abort();
      return;
    }
    onNext(x);
  }
  onComplete();
  controller.abort();
}

export default (...values) => {
  const observable = new Observable(subscribeActual);
  observable.values = values;
  return observable;
};
