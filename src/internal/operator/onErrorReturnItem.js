import Observable from '../../observable';
import { cleanObserver } from '../utils';

function subscribeActual(observer) {
  const { onNext, onComplete, onSubscribe } = cleanObserver(observer);

  const { source, item } = this;

  source.subscribeWith({
    onSubscribe,
    onComplete,
    onNext,
    onError() {
      onNext(item);
      onComplete();
    },
  });
}
/**
 * @ignore
 */
export default (source, item) => {
  if (item == null) {
    return source;
  }

  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.item = item;
  return observable;
};
