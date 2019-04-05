import AbortController from 'abort-controller';
import {
  onErrorHandler, onNextHandler, cleanObserver, onCompleteHandler, isFunction,
} from '../utils';
import Observable from '../../observable';
import error from './error';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onNext, onComplete, onError, onSubscribe,
  } = cleanObserver(observer);

  const emitter = new AbortController();
  emitter.onComplete = onCompleteHandler.bind(this);
  emitter.onError = onErrorHandler.bind(this);
  emitter.onNext = onNextHandler.bind(this);

  this.controller = emitter;
  this.onComplete = onComplete;
  this.onError = onError;
  this.onNext = onNext;

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
  if (!isFunction(subscriber)) {
    return error(new Error('Observable.create: There are no subscribers.'));
  }
  const observable = new Observable(subscribeActual);
  observable.subscriber = subscriber;
  return observable;
};
