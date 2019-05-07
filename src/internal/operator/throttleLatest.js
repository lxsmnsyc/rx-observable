import { LinkedCancellable } from 'rx-cancellable';
import {
  isNumber, defaultScheduler, cleanObserver, exists,
} from '../utils';
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

  const { skipTime, scheduler, emitLast } = this;

  let latest;

  this.source.subscribeWith({
    onSubscribe(c) {
      controller.link(c);
    },
    onComplete() {
      if (emitLast && exists(latest)) {
        onNext(latest);
      }
      onComplete();
    },
    onError,
    onNext(x) {
      if (!skipControl || skipControl.cancelled) {
        skipControl = scheduler.delay(() => {
          if (exists(latest)) {
            onNext(latest);
          }
          latest = null;
        }, skipTime);
        onNext(x);
      } else {
        latest = x;
      }
    },
  });
}
/**
 * @ignore
 */
export default (source, skipTime, scheduler, emitLast) => {
  if (!isNumber(skipTime)) {
    return source;
  }
  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.skipTime = skipTime;
  observable.scheduler = defaultScheduler(scheduler);
  observable.emitLast = emitLast;
  return observable;
};
