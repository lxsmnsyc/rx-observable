import { LinkedCancellable } from 'rx-cancellable';
import Observable from '../../observable';
import { cleanObserver, isFunction } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onSubscribe, onComplete, onError, onNext,
  } = cleanObserver(observer);

  const controller = new LinkedCancellable();

  onSubscribe(controller);

  const { source, bipredicate } = this;

  let retries = -1;

  const sub = () => {
    controller.unlink();
    retries += 1;

    source.subscribeWith({
      onSubscribe(ac) {
        controller.link(ac);
      },
      onComplete,
      onError(x) {
        if (isFunction(bipredicate)) {
          const result = bipredicate(retries, x);

          if (result) {
            sub();
          } else {
            onError(x);
            controller.cancel();
          }
        } else {
          sub();
        }
      },
      onNext,
    });
  };

  sub();
}

/**
 * @ignore
 */
export default (source, bipredicate) => {
  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.bipredicate = bipredicate;
  return observable;
};
