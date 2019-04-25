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

  controller.link(scheduler.delay(() => {
    controller.unlink();
    this.source.subscribeWith({
      onSubscribe(ac) {
        controller.link(ac);
      },
      onComplete,
      onError,
      onNext,
    });
  }, amount));
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
