/* eslint-disable no-loop-func */
/* eslint-disable no-restricted-syntax */
import { BooleanCancellable } from 'rx-cancellable';
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

  const controller = new BooleanCancellable();

  onSubscribe(controller);

  for (const i of this.iterable) {
    if (controller.cancelled) {
      return;
    }
    if (i == null) {
      onError(new Error('Observable.fromIterable: one of the elements is a null value.'));
      controller.cancel();
      return;
    }
    onNext(i);
  }

  if (!controller.cancelled) {
    onComplete();
    controller.cancel();
  }
}
/**
 * @ignore
 */
export default (iterable) => {
  if (!isIterable(iterable)) {
    return error(new Error('Observable.iterable: sources is not Iterable.'));
  }
  const observable = new Observable(subscribeActual);
  observable.iterable = iterable;
  return observable;
};
