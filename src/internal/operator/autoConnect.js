import Observable from '../../observable';
import { isNumber, cleanObserver } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  this.source.subscribeWith(cleanObserver(observer));

  this.count -= 1;

  if (this.count <= 0) {
    this.source.connect(this.consumer);
  }
}

/**
 * @ignore
 */
export default (source, count, consumer) => {
  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.count = isNumber(count) ? count : 1;
  observable.consumer = consumer;
  return observable;
};
