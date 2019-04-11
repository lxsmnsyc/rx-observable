
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

  const { amount, scheduler } = this;

  const controller = new AbortController();

  const { signal } = controller;

  onSubscribe(controller);

  if (signal.aborted) {
    return;
  }

  const timeout = scheduler.delay(
    () => {
      onError(new Error('Observable.timeout: TimeoutException (no success signals within the specified timeout).'));
      controller.abort();
    },
    amount,
  );

  const { signal: sig } = timeout;

  signal.addEventListener('abort', () => timeout.abort());

  this.source.subscribeWith({
    onSubscribe(ac) {
      signal.addEventListener('abort', () => ac.abort());
    },
    onComplete() {
      onComplete();
      controller.abort();
    },
    onError(x) {
      onError(x);
      controller.abort();
    },
    onNext(x) {
      if (!sig.aborted) {
        timeout.abort();
      }
      onNext(x);
    }
  });
}
/**
 * @ignore
 */
export default (source, amount, scheduler) => {
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
  return observable;
};
