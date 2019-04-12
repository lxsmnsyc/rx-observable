import { LinkedCancellable } from 'rx-cancellable';
import Scheduler from 'rx-scheduler';
import Observable from '../../observable';
import { isNumber, cleanObserver } from '../utils';


function subscribeActual(observer) {
  const {
    onSubscribe, onNext, onError, onComplete,
  } = cleanObserver(observer);

  const controller = new LinkedCancellable();

  onSubscribe(controller);

  const { source, amount, schedule } = this;

  const timeout = schedule.delay(() => {}, amount);

  controller.addEventListener('cancel', () => timeout.cancel());

  source.subscribeWith({
    onSubscribe(ac) {
      controller.link(ac);
    },
    onComplete,
    onError,
    onNext,
  });
}

export default (source, amount, scheduler) => {
  if (!isNumber(amount)) {
    return source;
  }
  let sched = scheduler;
  if (!(sched instanceof Scheduler.interface)) {
    sched = Scheduler.current;
  }
  const observable = new Observable(subscribeActual);
  observable.amount = amount;
  observable.source = source;
  return observable;
};
