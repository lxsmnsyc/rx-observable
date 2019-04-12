/* eslint-disable no-restricted-syntax */
import { BooleanCancellable } from 'rx-cancellable';
import Observable from '../../observable';
import { cleanObserver } from '../utils';

function subscribeActual(observer) {
  const {
    onNext, onError, onComplete, onSubscribe,
  } = cleanObserver(observer);

  const controller = new BooleanCancellable();

  const { values } = this;

  onSubscribe(controller);

  if (controller.cancelled) {
    return;
  }

  for (const x of values) {
    if (x == null) {
      onError(new Error('Observable.just: attempt to send null value.'));
      controller.cancel();
      return;
    }
    onNext(x);
  }
  onComplete();
  controller.cancel();
}
/**
 * @ignore
 */
export default (...values) => {
  const observable = new Observable(subscribeActual);
  observable.values = values;
  return observable;
};
