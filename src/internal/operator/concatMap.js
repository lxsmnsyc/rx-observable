import { LinkedCancellable } from 'rx-cancellable';
import { isFunction, cleanObserver } from '../utils';
import Observable from '../../observable';
import is from '../is';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onSubscribe, onNext, onError, onComplete,
  } = cleanObserver(observer);

  const controller = new LinkedCancellable();
  onSubscribe(controller);

  const { source, mapper } = this;

  const queue = [];

  let requestComplete;
  let running;

  const getNext = () => {
    controller.unlink();
    queue.shift().subscribeWith({
      onSubscribe(c) {
        controller.link(c);
      },
      onComplete() {
        if (queue.length > 0) {
          getNext();
        } else if (requestComplete) {
          onComplete();
        } else {
          controller.unlink();
          running = false;
        }
      },
      onError,
      onNext,
    });
  };

  source.subscribeWith({
    onSubscribe(c) {
      controller.addEventListener('cancel', () => c.cancel());
    },
    onNext(x) {
      let result;

      try {
        result = mapper(x);

        if (!is(result)) {
          throw new Error('Observable.concatMap: mapper function returned a non-Observable.');
        }
      } catch (e) {
        onError(e);
        controller.cancel();
        return;
      }

      queue.push(result);

      if (!running) {
        running = true;
        getNext();
      }
    },
    onError(x) {
      onError(x);
      controller.cancel();
    },
    onComplete() {
      if (running) {
        requestComplete = true;
      } else {
        onComplete();
      }
    },
  });
}

/**
 * @ignore
 */
export default (source, mapper) => {
  if (!isFunction(mapper)) {
    return source;
  }
  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.mapper = mapper;
  return observable;
};
