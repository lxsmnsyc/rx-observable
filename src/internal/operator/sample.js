import { LinkedCancellable } from 'rx-cancellable';
import Observable from '../../observable';
import {
  isNumber, defaultScheduler, cleanObserver, exists,
} from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onSubscribe, onNext, onError, onComplete,
  } = cleanObserver(observer);

  const {
    source, amount, scheduler, emitLast,
  } = this;

  const controller = new LinkedCancellable();
  onSubscribe(controller);

  let timer;
  let last;
  const startTimer = () => {
    timer = scheduler.delay(() => {
      if (exists(last)) {
        onNext(last);
      }
      last = null;
      startTimer();
    }, amount);
  };

  controller.addEventListener('cancel', () => timer.cancel());

  source.subscribeWith({
    onSubscribe(c) {
      controller.link(c);
      startTimer();
    },
    onNext(x) {
      last = x;
    },
    onComplete() {
      if (emitLast && exists(last)) {
        onNext(last);
      }
      onComplete();
    },
    onError,
  });
}
/**
 * @ignore
 */
export default (source, amount, scheduler, emitLast) => {
  if (!isNumber(amount)) {
    return source;
  }
  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.amount = amount;
  observable.scheduler = defaultScheduler(scheduler);
  observable.emitLast = emitLast;
  return observable;
};
