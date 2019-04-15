/* eslint-disable no-restricted-syntax */
import { BooleanCancellable } from 'rx-cancellable';
import Observable from '../../observable';
import { cleanObserver, isNumber } from '../utils';
import error from './error';

const { sign } = Math;

function subscribeActual(observer) {
  const {
    onNext, onComplete, onSubscribe,
  } = cleanObserver(observer);

  const controller = new BooleanCancellable();

  const { min, max, step } = this;

  onSubscribe(controller);

  if (controller.cancelled) {
    return;
  }

  const direction = step * sign(max - min);
  for (let i = min; (direction < 0 ? i >= max : i <= max); i += direction) {
    if (controller.cancelled) {
      return;
    }
    onNext(i);
  }
  onComplete();
  controller.cancel();
}
/**
 * @ignore
 */
export default (min, max, step) => {
  if (!isNumber(min)) {
    return error('Observable.range: "min" is not a number.');
  }
  if (!isNumber(max)) {
    return error('Observable.range: "max" is not a number.');
  }

  let st = step;
  if (!isNumber(step)) {
    st = 1;
  }
  const observable = new Observable(subscribeActual);
  observable.min = min;
  observable.max = max;
  observable.step = st;
  return observable;
};
