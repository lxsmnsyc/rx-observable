import { LinkedCancellable } from 'rx-cancellable';
import Observable from '../../observable';
import { isNumber, cleanObserver } from '../utils';


function subscribeActual(observer) {
  const {
    onSubscribe, onNext, onError, onComplete,
  } = cleanObserver(observer);

  const controller = new LinkedCancellable();

  onSubscribe(controller);

  const { source, amount } = this;

  let count = 0;

  source.subscribeWith({
    onSubscribe(ac) {
      controller.link(ac);
    },
    onComplete,
    onError,
    onNext(x) {
      count += 1;
      onNext(x);
      if (count >= amount) {
        onComplete();
        controller.cancel();
      }
    },
  });
}

export default (source, amount) => {
  if (!isNumber(amount)) {
    return source;
  }
  const observable = new Observable(subscribeActual);
  observable.amount = amount;
  observable.source = source;
  return observable;
};
