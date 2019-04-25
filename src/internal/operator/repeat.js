import { LinkedCancellable } from 'rx-cancellable';
import Observable from '../../observable';
import { cleanObserver, isNumber } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onSubscribe, onNext, onComplete, onError,
  } = cleanObserver(observer);

  const controller = new LinkedCancellable();

  onSubscribe(controller);

  const { source, times } = this;

  let retries = -1;

  const sub = () => {
    controller.unlink();
    retries += 1;

    source.subscribeWith({
      onSubscribe(ac) {
        controller.link(ac);
      },
      onComplete() {
        if (isNumber(times)) {
          if (retries <= times) {
            sub();
          } else {
            onComplete();
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
export default (source, times) => {
  if (times != null) {
    if (!isNumber(times)) {
      return source;
    }
    if (times <= 0) {
      return source;
    }
  }
  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.times = times;
  return observable;
};
