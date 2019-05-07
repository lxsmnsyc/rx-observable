import { LinkedCancellable } from 'rx-cancellable';
import { isNumber, cleanObserver, defaultScheduler } from '../utils';
import Observable from '../../observable';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onSubscribe, onNext, onError, onComplete,
  } = cleanObserver(observer);

  const controller = new LinkedCancellable();
  onSubscribe(controller);

  const { source, timespan, scheduler } = this;

  const buffer = [];

  let timed;

  controller.addEventListener('cancel', () => {
    if (timed) {
      timed.cancel();
    }
  });

  const emitNext = () => {
    timed = scheduler.delay(() => {
      onNext(buffer.splice(0));
      emitNext();
    }, timespan);
  };

  source.subscribeWith({
    onSubscribe(c) {
      controller.link(c);
      emitNext();
    },
    onComplete,
    onError,
    onNext(x) {
      buffer.push(x);
    },
  });
}

/**
 * @ignore
 */
export default (source, timespan, scheduler) => {
  if (!isNumber(timespan)) {
    return source;
  }
  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.timespan = timespan;
  observable.scheduler = defaultScheduler(scheduler);
  return observable;
};
