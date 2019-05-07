import { LinkedCancellable } from 'rx-cancellable';
import Observable from '../../observable';
import { isNumber, cleanObserver } from '../utils';


/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onSubscribe, onNext, onError, onComplete,
  } = cleanObserver(observer);

  const controller = new LinkedCancellable();

  onSubscribe(controller);

  const { source, amount } = this;

  const buffer = [];

  source.subscribeWith({
    onSubscribe(ac) {
      controller.link(ac);
    },
    onComplete,
    onError,
    onNext(x) {
      buffer.push(x);
      if (buffer.length > amount) {
        onNext(buffer.shift());
      }
    },
  });
}
/**
 * @ignore
 */
export default (source, amount) => {
  if (!isNumber(amount)) {
    return source;
  }
  const observable = new Observable(subscribeActual);
  observable.amount = amount;
  observable.source = source;
  return observable;
};
