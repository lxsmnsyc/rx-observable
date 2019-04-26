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

  const { amount, scheduler, doDelayError } = this;

  const controller = new LinkedCancellable();

  onSubscribe(controller);

  this.source.subscribeWith({
    onSubscribe(ac) {
      controller.link(ac);
    },
    onNext(x) {
      const timer = scheduler.delay(() => {
        onNext(x);
      }, amount);

      controller.addEventListener('cancel', () => timer.cancel());
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
  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.amount = amount;
  observable.scheduler = defaultScheduler(scheduler);
  observable.doDelayError = doDelayError;
  return observable;
};
