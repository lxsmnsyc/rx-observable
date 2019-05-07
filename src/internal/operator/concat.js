/* eslint-disable no-restricted-syntax */
import { LinkedCancellable } from 'rx-cancellable';
import Observable from '../../observable';
import { cleanObserver, isIterable } from '../utils';
import error from './error';
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

  const { sources } = this;
  const generate = sources[Symbol.iterator]();

  const sub = () => {
    const { value, done } = generate.next();
    if (!(is(value) || done)) {
      onError(new Error('Observable.concat: one of the sources is a non-Observable.'));
      controller.cancel();
      return;
    }
    controller.unlink();
    value.subscribeWith({
      onSubscribe(ac) {
        controller.link(ac);
      },
      onComplete() {
        if (done) {
          onComplete();
          controller.cancel();
          return;
        }
        sub();
      },
      onError,
      onNext,
    });
  };

  sub();
}
/**
 * @ignore
 */
export default (sources) => {
  if (!isIterable(sources)) {
    return error(new Error('Observable.concat: sources is not Iterable.'));
  }
  const observable = new Observable(subscribeActual);
  observable.sources = sources;
  return observable;
};
