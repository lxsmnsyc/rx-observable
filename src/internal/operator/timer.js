import AbortController from 'abort-controller';
import Scheduler from 'rx-scheduler';
import Observable from '../../observable';
import { cleanObserver, isNumber } from '../utils';
import error from './error';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onNext, onComplete, onSubscribe,
  } = cleanObserver(observer);

  const controller = new AbortController();

  const { signal } = controller;

  onSubscribe(controller);

  if (signal.aborted) {
    return;
  }

  const timeout = this.scheduler.delay(() => {
    onNext(0);
    onComplete();
  }, this.amount);

  signal.addEventListener('abort', () => timeout.abort());
}
/**
 * @ignore
 */
export default (amount, scheduler) => {
  if (!isNumber(amount)) {
    return error(new Error('Observable.timer: "amount" is not a number.'));
  }

  let sched = scheduler;
  if (!(sched instanceof Scheduler.interface)) {
    sched = Scheduler.current;
  }
  const observable = new Observable(subscribeActual);
  observable.amount = amount;
  observable.scheduler = sched;
  return observable;
};
