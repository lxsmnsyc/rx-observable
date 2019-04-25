/* eslint-disable no-loop-func */
/* eslint-disable no-restricted-syntax */
import { BooleanCancellable } from 'rx-cancellable';
import Observable from '../../observable';
import {
  cleanObserver, isArray, isNull, immediateComplete,
} from '../utils';
import error from './error';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onNext, onComplete, onError, onSubscribe,
  } = cleanObserver(observer);

  const { array } = this;
  const { length } = array;

  if (length === 0) {
    immediateComplete(observer);
  } else {
    const controller = new BooleanCancellable();

    onSubscribe(controller);

    for (let i = 0; i < length; i += 1) {
      const item = array[i];
      if (controller.cancelled) {
        return;
      }
      if (isNull(item)) {
        onError(new Error('Observable.fromArray: one of the elements is a null value.'));
        controller.cancel();
        return;
      }
      onNext(item);
    }

    if (!controller.cancelled) {
      onComplete();
      controller.cancel();
    }
  }
}
/**
 * @ignore
 */
export default (arr) => {
  if (!isArray(arr)) {
    return error(new Error('Observable.fromArray: sources is not Array.'));
  }
  const observable = new Observable(subscribeActual);
  observable.array = arr;
  return observable;
};
