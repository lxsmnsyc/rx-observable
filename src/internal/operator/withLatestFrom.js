import { CompositeCancellable } from 'rx-cancellable';
import is from '../is';
import {
  isFunction, cleanObserver, exists, isNull,
} from '../utils';
import Observable from '../../observable';

/**
 * @ignore
 */
const defaultCombiner = (a, b) => [a, b];
/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onSubscribe, onNext, onError, onComplete,
  } = cleanObserver(observer);

  let latest;

  const controller = new CompositeCancellable();
  onSubscribe(controller);

  const { source, other, combiner } = this;

  other.subscribeWith({
    onSubscribe(c) {
      controller.add(c);
    },
    onComplete() {
      onComplete();
      controller.cancel();
    },
    onError(x) {
      onError(x);
      controller.cancel();
    },
    onNext(x) {
      latest = x;
    },
  });

  source.subscribeWith({
    onSubscribe(c) {
      controller.add(c);
    },
    onComplete() {
      onComplete();
      controller.cancel();
    },
    onError(x) {
      onError(x);
      controller.cancel();
    },
    onNext(x) {
      if (exists(latest)) {
        let result;

        try {
          result = combiner(x, latest);

          if (isNull(result)) {
            throw new Error('Observable.withLatestFrom: combiner returned a null value.');
          }
        } catch (e) {
          onError(e);
          controller.cancel();
          return;
        }

        onNext(result);
      }
    },
  });
}
/**
 * @ignore
 */
export default (source, other, combiner) => {
  if (!is(other)) {
    return source;
  }
  let comb = combiner;
  if (!isFunction(combiner)) {
    comb = defaultCombiner;
  }

  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.other = other;
  observable.combiner = comb;
  return observable;
};
