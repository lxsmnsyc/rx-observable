import { LinkedCancellable } from 'rx-cancellable';
import Observable from '../../observable';
import { cleanObserver, defaultScheduler } from '../utils';

function subscribeActual(observer) {
  const {
    onNext, onComplete, onError, onSubscribe,
  } = cleanObserver(observer);

  const { source, scheduler } = this;

  const controller = new LinkedCancellable();

  onSubscribe(controller);

  source.subscribeWith({
    onSubscribe(ac) {
      controller.link(ac);
    },
    onComplete() {
      controller.link(scheduler.schedule(onComplete));
    },
    onError(x) {
      controller.link(scheduler.schedule(() => {
        onError(x);
      }));
    },
    onNext(x) {
      const { linked } = controller;
      controller.link(scheduler.schedule(() => {
        controller.link(linked);
        onNext(x);
      }));
    },
  });
}
/**
 * @ignore
 */
export default (source, scheduler) => {
  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.scheduler = defaultScheduler(scheduler);
  return observable;
};
