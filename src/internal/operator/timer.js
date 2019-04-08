/* eslint-disable no-restricted-syntax */
import AbortController from 'abort-controller';
import Observable from '../../observable';
import { cleanObserver, isNumber } from '../utils';
import error from './error';

function subscribeActual(observer) {
  const {
    onNext, onComplete, onSubscribe,
  } = cleanObserver(observer);

  const controller = new AbortController();

  const { amount } = this;

  onSubscribe(controller);

  const { signal } = controller;

  if (signal.aborted) {
    return;
  }

  const timer = setTimeout(() => {
    onNext(0);
    onComplete();
  }, amount);

  signal.addEventListener('abort', () => clearTimeout(timer));
}

export default (amount) => {
  if (isNumber(amount)) {
    return error(new Error('Observable.timer: "amount" is not a number.'));
  }
  const observable = new Observable(subscribeActual);
  observable.amount = observable;
  return observable;
};
