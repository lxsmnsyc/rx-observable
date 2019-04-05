/* eslint-disable no-loop-func */
/* eslint-disable no-restricted-syntax */
import AbortController from 'abort-controller';
import Observable from '../../observable';
import { isIterable, cleanObserver } from '../utils';
import error from './error';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onNext, onComplete, onError, onSubscribe,
  } = cleanObserver(observer);

  const controller = new AbortController();

  const { signal } = controller;

  onSubscribe(controller);

  if (signal.aborted) {
    return;
  }

  const { sources } = this;

  const controllers = [];

  signal.addEventListener('abort', () => controllers.forEach(x => x[0].abort()));

  let winner;

  for (const observable of sources) {
    if (signal.aborted) {
      return;
    }
    if (observable instanceof Observable) {
      observable.subscribeWith({
        onSubscribe(ac) {
          controllers.push([ac, observable]);
        },
        onComplete() {
          if (winner == null) {
            winner = observable;

            const aborts = controllers.filter(x => x[1] !== observable).map(x => x[0]);

            for (const ac of aborts) {
              ac.abort();
            }
          }
          if (winner === observable) {
            onComplete();
            controller.abort();
          }
        },
        onError(x) {
          if (winner == null) {
            winner = observable;

            const aborts = controllers.filter(a => a[1] !== observable).map(a => a[0]);

            for (const ac of aborts) {
              ac.abort();
            }
          }
          if (winner === observable) {
            onError(x);
            controller.abort();
          }
        },
        onNext(x) {
          if (winner == null) {
            winner = observable;

            const aborts = controllers.filter(a => a[1] !== observable).map(a => a[0]);

            for (const ac of aborts) {
              ac.abort();
            }
          }
          if (winner === observable) {
            onNext(x);
          }
        },
      });
    } else {
      onError(new Error('Observable.amb: One of the sources is a non-Observable.'));
      controller.abort();
      break;
    }
  }
}
/**
 * @ignore
 */
export default (sources) => {
  if (!isIterable(sources)) {
    return error(new Error('Observable.amb: sources is not Iterable.'));
  }
  const observable = new Observable(subscribeActual);
  observable.sources = sources;
  return observable;
};
