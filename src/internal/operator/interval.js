import { LinkedCancellable } from 'rx-cancellable';
import { isNumber, defaultScheduler, cleanObserver } from '../utils';
import error from './error';
import Observable from '../../observable';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onSubscribe, onNext,
  } = cleanObserver(observer);

  const controller = new LinkedCancellable();
  onSubscribe(controller);

  const { interval, delay, scheduler } = this;

  let state = 0;

  const emitNext = () => {
    controller.link(scheduler.delay(() => {
      onNext(state);
      state += 1;
      emitNext();
    }, interval));
  };

  scheduler.delay(emitNext, delay);
}
/**
 * @ignore
 */
export default (interval, delay, scheduler) => {
  if (!isNumber(interval)) {
    return error(new Error('Observable.interval: interval is not a number.'));
  }
  const observable = new Observable(subscribeActual);
  observable.interval = interval;
  observable.delay = delay;
  observable.scheduler = defaultScheduler(scheduler);
  return observable;
};
