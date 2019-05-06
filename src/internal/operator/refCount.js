import { LinkedCancellable } from 'rx-cancellable';
import Observable from '../../observable';
import { cleanObserver, isNumber, defaultScheduler } from '../utils';
import doOnCancel from './doOnCancel';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onSubscribe, onNext, onError, onComplete,
  } = cleanObserver(observer);

  const {
    source, timeout, scheduler,
  } = this;

  const controller = new LinkedCancellable();
  onSubscribe(controller);

  const observable = this;

  doOnCancel(source, () => {
    this.max -= 1;

    if (this.max === 0) {
      scheduler.delay(() => {
        this.subscription.cancel();
      }, timeout);
    }
  }).subscribeWith({
    onSubscribe(c) {
      controller.link(c);

      observable.max += 1;
      observable.count -= 1;

      if (observable.count === 0) {
        observable.subscription = source.connect();
      }
    },
    onComplete,
    onError,
    onNext,
  });
}

/**
 * @ignore
 */
export default (source, count, timeout, scheduler) => {
  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.count = isNumber(count) ? count : 1;
  observable.max = 0;
  observable.timeout = isNumber(timeout) ? timeout : 0;
  observable.scheduler = defaultScheduler(scheduler);
  observable.subscription = null;
  return observable;
};
