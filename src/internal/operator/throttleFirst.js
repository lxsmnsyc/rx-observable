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

  const controller = new LinkedCancellable();
  onSubscribe(controller);

  let skipControl;

  controller.addEventListener('cancel', () => {
    if (skipControl) skipControl.cancel();
  });

  const { skipTime, scheduler } = this;

  this.source.subscribeWith({
    onSubscribe(c) {
      controller.link(c);
    },
    onComplete,
    onError,
    onNext(x) {
      if (!skipControl || skipControl.cancelled) {
        skipControl = scheduler.delay(() => {}, skipTime);
        onNext(x);
      }
    },
  });
}
/**
 * @ignore
 */
export default (source, skipTime, scheduler) => {
  if (!isNumber(skipTime)) {
    return source;
  }
  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.skipTime = skipTime;
  observable.scheduler = defaultScheduler(scheduler);
  return observable;
};
