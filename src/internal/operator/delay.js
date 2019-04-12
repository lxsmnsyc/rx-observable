import Scheduler from 'rx-scheduler';
import { LinkedCancellable } from 'rx-cancellable';
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

  const controller = new LinkedCancellable();

  onSubscribe(controller);

  this.source.subscribeWith({
    onSubscribe(ac) {
      controller.link(ac);
    },
    onNext(x) {
      controller.link(scheduler.delay(() => {
        controller.unlink();
        onNext(x);
      }, amount));
    },
    onComplete() {
      controller.link(scheduler.delay(() => {
        onComplete();
      }, amount));
    },
    onError(x) {
      controller.link(scheduler.delay(() => {
        onError(x);
      }, doDelayError ? amount : 0));
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
