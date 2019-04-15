import { LinkedCancellable } from 'rx-cancellable';
import { isFunction } from '../utils';
/**
 * @ignore
 */
export default (source, predicate) => {
  const controller = new LinkedCancellable();
  if (!isFunction(predicate)) {
    controller.cancel();
  } else {
    source.subscribeWith({
      onSubscribe(ac) {
        controller.link(ac);
      },
      onComplete() {
        controller.cancel();
      },
      onError(x) {
        controller.cancel();
        throw x;
      },
      onNext(x) {
        if (!predicate(x)) {
          controller.cancel();
        }
      },
    });
  }
  return controller;
};
