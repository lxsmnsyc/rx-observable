/* eslint-disable no-restricted-syntax */
import { BooleanCancellable } from 'rx-cancellable';
import Observable from '../../observable';
import { cleanObserver, isNull, immediateComplete } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onNext, onComplete, onError, onSubscribe,
  } = cleanObserver(observer);

  const { values } = this;
  const { length } = values;

  if (length === 0) {
    immediateComplete(observer);
  } else {
    const controller = new BooleanCancellable();

    onSubscribe(controller);

    for (let i = 0; i < length; i += 1) {
      const item = values[i];
      if (controller.cancelled) {
        return;
      }
      if (isNull(item)) {
        onError(new Error('Observable.just: one of the elements is a null value.'));
        controller.cancel();
        return;
      }
      onNext(item);
    }

    if (!controller.cancelled) {
      onComplete();
      controller.cancel();
    }
  }
}
/**
 * @ignore
 */
export default (...values) => {
  const observable = new Observable(subscribeActual);
  observable.values = values;
  return observable;
};
