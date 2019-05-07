import { LinkedCancellable } from 'rx-cancellable';
import { isNumber, cleanObserver } from '../utils';
import Observable from '../../observable';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onSubscribe, onNext, onError, onComplete,
  } = cleanObserver(observer);

  const controller = new LinkedCancellable();
  onSubscribe(controller);

  const { source, count, skip } = this;

  const buffer = [];
  let counter = 0;
  source.subscribeWith({
    onSubscribe(c) {
      controller.link(c);
    },
    onComplete,
    onError,
    onNext(x) {
      if (buffer.length < count) {
        buffer.push(x);
      }
      counter += 1;
      if (counter >= skip) {
        onNext(buffer.splice(0, count));
        counter = 0;
      }
    },
  });
}
/**
 * @ignore
 */
export default (source, count, skip) => {
  if (!isNumber(count)) {
    return source;
  }
  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.count = count;
  observable.skip = isNumber(skip) ? skip : count;
  return observable;
};
