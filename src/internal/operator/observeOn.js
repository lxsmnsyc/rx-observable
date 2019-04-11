import AbortController from 'abort-controller';
import Scheduler from 'rx-scheduler';
import Observable from '../../observable';
import { cleanObserver } from '../utils';

function subscribeActual(observer) {
  const {
    onNext, onComplete, onError, onSubscribe,
  } = cleanObserver(observer);

  const { source, scheduler } = this;

  const controller = new AbortController();
  onSubscribe(controller);

  const { signal } = controller;

  if (signal.aborted) {
    return;
  }

  source.subscribeWith({
    onSubscribe(ac) {
      signal.addEventListener('abort', () => ac.abort());
    },
    onComplete() {
      scheduler.schedule(() => {
        onComplete();
        controller.abort();
      });
    },
    onError(x) {
      scheduler.schedule(() => {
        onError(x);
        controller.abort();
      });
    },
    onNext(x) {
      scheduler.schedule(() => onNext(x));
    },
  });
}
/**
 * @ignore
 */
export default (source, scheduler) => {
  let sched = scheduler;
  if (!(sched instanceof Scheduler.interface)) {
    sched = Scheduler.current;
  }
  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.scheduler = sched;
  return observable;
};
