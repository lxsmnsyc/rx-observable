/* eslint-disable no-loop-func */
import { CompositeCancellable } from 'rx-cancellable';
import { isArray, isFunction, immediateError } from '../utils';
import error from './error';
import Observable from '../../observable';
import is from '../is';

/**
 * @ignore
 */
const defaultCombiner = x => x;
/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onSubscribe, onNext, onError, onComplete,
  } = observer;

  const { sources, combiner } = this;
  const { length } = sources;

  if (length === 0) {
    immediateError(new Error('Observable.combineLatestArray: sources is not empty.'));
  } else {
    const controller = new CompositeCancellable();
    onSubscribe(controller);

    let pendingNext = length;
    let pendingComplete = length;

    const buffer = [];
    for (let i = 0; i < sources.length; i += 1) {
      const observable = sources[i];
      if (controller.cancelled) {
        return;
      }
      if (is(observable)) {
        observable.subscribeWith({
          onSubscribe(ac) {
            controller.add(ac);
          },
          onComplete() {
            if (pendingComplete === 0) {
              onComplete();
              controller.cancel();
            } else {
              pendingComplete -= 1;
            }
          },
          onError(x) {
            onError(x);
            controller.cancel();
          },
          onNext(x) {
            buffer[i] = x;

            if (pendingNext > 0) {
              pendingNext -= 1;
            }
            if (pendingNext === 0) {
              onNext(combiner(buffer));
            }
          },
        });
      } else {
        onError(new Error('Observable.ambArray: One of the sources is a non-Observable.'));
        controller.cancel();
        break;
      }
    }
  }
}
/**
 * @ignore
 */
export default (sources, combiner) => {
  if (!isArray(sources)) {
    return error(new Error('Observable.combineLatestArray: sources is not Array.'));
  }
  let combo = combiner;
  if (!isFunction(combo)) {
    combo = defaultCombiner;
  }
  const observable = new Observable(subscribeActual);
  observable.sources = sources;
  observable.combiner = combo;
  return observable;
};
