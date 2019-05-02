import { LinkedCancellable } from 'rx-cancellable';
import Observable from '../../observable';
import { isNumber, cleanObserver, defaultScheduler } from '../utils';


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
    onNext(x) {
      if (timeout.cancelled) {
        onNext(x);
      }
    },
  });
}

export default (source, amount, scheduler) => {
  if (!isNumber(amount)) {
    return source;
  }
  const observable = new Observable(subscribeActual);
  observable.amount = amount;
  observable.source = source;
  observable.scheduler = defaultScheduler(scheduler);
  return observable;
};
