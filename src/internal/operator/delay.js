import AbortController from 'abort-controller';
import Scheduler from 'rx-scheduler';
import Observable from '../../observable';
import { cleanObserver, isNumber } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onNext, onComplete, onError, onSubscribe,
  } = cleanObserver(observer);

  const { amount, scheduler, doDelayError } = this;

  const controller = new AbortController();

  const { signal } = controller;

  onSubscribe(controller);

  if (signal.aborted) {
    return;
  }

  this.source.subscribeWith({
    onSubscribe(ac) {
      signal.addEventListener('abort', () => ac.abort());
    },
    onNext(x) {
      const ac = scheduler.delay(() => {
        onNext(x);
      }, amount);

      signal.addEventListener('abort', () => {
        ac.abort();
      });
    },
    onComplete() {
      const ac = scheduler.delay(() => {
        onComplete();
        controller.abort();
      }, amount);

      signal.addEventListener('abort', () => {
        ac.abort();
      });
    },
    onError(x) {
      const ac = scheduler.delay(() => {
        onError(x);
        controller.abort();
      }, doDelayError ? amount : 0);

      signal.addEventListener('abort', () => {
        ac.abort();
      });
    },
  });
}
/**
 * @ignore
 */
export default (source, amount, scheduler, doDelayError) => {
  if (!isNumber(amount)) {
    return source;
  }
  let sched = scheduler;
  if (!(sched instanceof Scheduler.interface)) {
    sched = Scheduler.current;
  }
  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.amount = amount;
  observable.scheduler = sched;
  observable.doDelayError = doDelayError;
  return observable;
};
