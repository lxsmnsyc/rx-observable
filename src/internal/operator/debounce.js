import { LinkedCancellable } from 'rx-cancellable';
import { isNumber, defaultScheduler, cleanObserver } from '../utils';
import Observable from '../../observable';
/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onSubscribe, onNext, onError, onComplete,
  } = cleanObserver(observer);

  const { source, amount, scheduler } = this;

  const controller = new LinkedCancellable();

  onSubscribe(controller);

  let requestComplete;

  let prevTimer;

  const serve = (x) => {
    if (prevTimer) prevTimer.cancel();

    prevTimer = scheduler.delay(() => {
      onNext(x);

      if (requestComplete) {
        onComplete();
      }

      prevTimer = null;
    }, amount);
  };

  controller.addEventListener('cancel', () => prevTimer && prevTimer.cancel());

  source.subscribeWith({
    onSubscribe(c) {
      controller.link(c);
    },
    onNext(x) {
      serve(x);
    },
    onComplete() {
      if (prevTimer) {
        requestComplete = true;
      } else {
        onComplete();
      }
    },
    onError(x) {
      onError(x);
      controller.cancel();
    },
  });
}
/**
 * @ignore
 */
export default (source, amount, scheduler) => {
  if (!isNumber(amount)) {
    return source;
  }
  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.amount = amount;
  observable.scheduler = defaultScheduler(scheduler);
  return observable;
};
