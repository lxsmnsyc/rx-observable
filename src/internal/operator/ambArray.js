/* eslint-disable no-loop-func */
/* eslint-disable no-restricted-syntax */
import { CompositeCancellable } from 'rx-cancellable';
import Observable from '../../observable';
import {
  cleanObserver, isNull, isArray, immediateError,
} from '../utils';
import error from './error';
import is from '../is';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onNext, onComplete, onError, onSubscribe,
  } = cleanObserver(observer);

  const { sources } = this;
  const { length } = sources;

  if (length === 0) {
    immediateError(observer, new Error('Completable.ambArray: sources Array is empty.'));
  } else {
    const controller = new CompositeCancellable();

    onSubscribe(controller);

    const controllers = [];

    let winner;

    const clean = (o) => {
      if (isNull(winner)) {
        winner = o;

        const aborts = controllers.filter(x => x[1] !== o).map(x => x[0]);

        for (const ac of aborts) {
          ac.cancel();
        }
      }
    };

    for (let i = 0; i < length; i += 1) {
      const observable = sources[i];
      if (controller.cancelled) {
        return;
      }
      if (is(observable)) {
        observable.subscribeWith({
          onSubscribe(ac) {
            controllers.push([ac, observable]);
          },
          onComplete() {
            clean();
            if (winner === observable) {
              onComplete();
              controller.cancel();
            }
          },
          onError(x) {
            clean();
            if (winner === observable) {
              onError(x);
              controller.cancel();
            }
          },
          onNext(x) {
            clean();
            if (winner === observable) {
              onNext(x);
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
export default (sources) => {
  if (!isArray(sources)) {
    return error(new Error('Observable.ambArray: sources is not Array.'));
  }
  const observable = new Observable(subscribeActual);
  observable.sources = sources;
  return observable;
};
