import { LinkedCancellable } from 'rx-cancellable';
import Observable from '../../observable';
import { cleanObserver, isFunction } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onSubscribe, onNext, onComplete, onError,
  } = cleanObserver(observer);

  const controller = new LinkedCancellable();

  onSubscribe(controller);

  const { source, predicate } = this;

  const sub = () => {
    controller.unlink();
    source.subscribeWith({
      onSubscribe(ac) {
        controller.link(ac);
      },
      onComplete() {
        if (isFunction(predicate)) {
          const result = predicate();

          if (result) {
            onComplete();
            controller.cancel();
          } else {
            sub();
          }
        } else {
          sub();
        }
      },
      onError,
      onNext,
    });
  };

  sub();
}

/**
 * @ignore
 */
export default (source, predicate) => {
  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.predicate = predicate;
  return observable;
};
