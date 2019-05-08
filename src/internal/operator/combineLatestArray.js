/* eslint-disable no-loop-func */
import { CompositeCancellable } from 'rx-cancellable';
import {
  isArray, isFunction, cleanObserver, isNull, immediateComplete,
} from '../utils';
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
  } = cleanObserver(observer);

  const { sources, combiner } = this;
  const { length } = sources;

  if (length === 0) {
    immediateComplete(observer);
  } else {
    const controller = new CompositeCancellable();
    onSubscribe(controller);

    let pendingComplete = length;

    const ready = [];

    let allReady;

    const check = () => {
      if (!allReady) {
        for (let i = 0; i < length; i += 1) {
          if (!ready[i]) {
            return false;
          }
        }
        allReady = true;
      }
      return allReady;
    };

    const buffer = [];

    for (let i = 0; i < length; i += 1) {
      const observable = sources[i];
      if (controller.cancelled) {
        return;
      }
      if (is(observable)) {
        buffer[i] = [];
        observable.subscribeWith({
          onSubscribe(ac) {
            controller.add(ac);
          },
          onComplete() {
            pendingComplete -= 1;
            if (pendingComplete === 0) {
              onComplete();
              controller.cancel();
            }
          },
          onError(x) {
            onError(x);
            controller.cancel();
          },
          onNext(x) {
            buffer[i] = x;

            ready[i] = true;

            if (check()) {
              let result;

              try {
                result = combiner(buffer);

                if (isNull(result)) {
                  throw new Error('Observable.combineLatestArray: combiner function returned a null.');
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
      } else {
        onError(new Error('Observable.combineLatestArray: One of the sources is a non-Observable.'));
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
