import { LinkedCancellable } from 'rx-cancellable';
import is from '../is';
import error from './error';
import Observable from '../../observable';
import { cleanObserver } from '../utils';

function subscribeActual(observer) {
  const {
    onSubscribe, onNext, onError, onComplete,
  } = cleanObserver(observer);

  const controller = new LinkedCancellable();
  onSubscribe(controller);

  let currentStream;
  let origin;

  this.source.subscribeWith({
    onSubscribe(c) {
      controller.link(c);
      origin = c;
    },
    onComplete() {
      if (!currentStream) {
        onComplete();
      }
    },
    onError,
    onNext(x) {
      if (!is(x)) {
        onError(new Error('Observable.switchOnNext: onNext called with a non-Observable.'));
        controller.cancel();
        return;
      }
      controller.unlink();
      if (currentStream) {
        currentStream.cancel();
      }
      x.subscribeWith({
        onSubscribe(c) {
          controller.link(c);
          currentStream = c;
        },
        onComplete() {
          currentStream = null;
          if (origin.cancelled) {
            onComplete();
          } else {
            controller.link(origin);
          }
        },
        onError,
        onNext,
      });
    },
  });
}

export default (source) => {
  if (!is(source)) {
    return error(new Error('Observable.switchOnNext: source is not an Observable.'));
  }
  const observable = new Observable(subscribeActual);
  observable.source = source;
  return observable;
};
