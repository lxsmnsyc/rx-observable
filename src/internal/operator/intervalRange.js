import { LinkedCancellable } from 'rx-cancellable';
import { isNumber, defaultScheduler, cleanObserver } from '../utils';
import error from './error';
import Observable from '../../observable';

const { sign } = Math;

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onSubscribe, onNext, onComplete,
  } = cleanObserver(observer);

  const controller = new LinkedCancellable();
  onSubscribe(controller);

  const {
    interval, delay, scheduler, max, min,
  } = this;

  let state = min;

  const direction = sign(max - min);

  const emitNext = () => {
    controller.link(scheduler.delay(() => {
      onNext(state);
      state += direction;
      if (direction < 0 ? state >= max : state <= max) {
        emitNext();
      } else {
        onComplete();
      }
    }, interval));
  };

  scheduler.delay(emitNext, delay);
}
/**
 * @ignore
 */
export default (min, max, interval, delay, scheduler) => {
  if (!isNumber(min)) {
    return error(new Error('Observable.interval: min is not a number.'));
  }
  if (!isNumber(max)) {
    return error(new Error('Observable.interval: max is not a number.'));
  }
  if (!isNumber(interval)) {
    return error(new Error('Observable.interval: interval is not a number.'));
  }
  const observable = new Observable(subscribeActual);
  observable.max = max;
  observable.min = min;
  observable.interval = interval;
  observable.delay = delay;
  observable.scheduler = defaultScheduler(scheduler);
  return observable;
};
