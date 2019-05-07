import { LinkedCancellable } from 'rx-cancellable';
import Observable from '../../observable';
import { cleanObserver, isNumber, defaultScheduler } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onNext, onComplete, onError, onSubscribe,
  } = cleanObserver(observer);

  const { amount, scheduler } = this;

  const controller = new LinkedCancellable();

  onSubscribe(controller);

  let timeout;

  controller.addEventListener('cancel', () => timeout && timeout.cancel());

  this.source.subscribeWith({
    onSubscribe(ac) {
      controller.link(ac);
    },
    onComplete,
    onError,
    onNext(x) {
      if (!timeout.cancelled) {
        timeout.cancel();
        timeout = scheduler.delay(
          () => {
            onError(new Error('Observable.timeout: TimeoutException (no success signals within the specified timeout).'));
            controller.cancel();
          },
          amount,
        );
      }
      onNext(x);
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
