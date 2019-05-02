import { LinkedCancellable } from 'rx-cancellable';
import Observable from '../../observable';
import { cleanObserver, isFunction } from '../utils';


function subscribeActual(observer) {
  const {
    onSubscribe, onNext, onError, onComplete,
  } = cleanObserver(observer);

  const controller = new LinkedCancellable();

  onSubscribe(controller);

  const { source, predicate } = this;

  let flag;

  source.subscribeWith({
    onSubscribe(ac) {
      controller.link(ac);
    },
    onComplete,
    onError,
    onNext(x) {
      if (!flag) {
        flag = !predicate(x);
      }
      if (flag) {
        onNext(x);
      }
    },
  });
}
/**
 * @ignore
 */
export default (source, predicate) => {
  if (!isFunction(predicate)) {
    return source;
  }
  const observable = new Observable(subscribeActual);
  observable.predicate = predicate;
  observable.source = source;
  return observable;
};
