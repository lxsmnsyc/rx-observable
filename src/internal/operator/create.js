import { cleanObserver } from '../utils';
import Observable from '../../observable';
import error from './error';
import ObservableEmitter from '../../emitter';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onNext, onComplete, onError, onSubscribe,
  } = cleanObserver(observer);

  const emitter = new ObservableEmitter(onNext, onComplete, onError);

  onSubscribe(emitter);

  try {
    this.subscriber(emitter);
  } catch (ex) {
    emitter.onError(ex);
  }
}
/**
 * @ignore
 */
export default (subscriber) => {
  if (typeof subscriber !== 'function') {
    return error(new Error('Observable.create: There are no subscribers.'));
  }
  const observable = new Observable(subscribeActual);
  observable.subscriber = subscriber;
  return observable;
};
