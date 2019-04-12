/* eslint-disable no-loop-func */
/* eslint-disable no-restricted-syntax */
import { CompositeCancellable } from 'rx-cancellable';
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

  const controller = new CompositeCancellable();

  onSubscribe(controller);

  const { sources } = this;

  const controllers = [];

  let winner;

  const clean = (o) => {
    if (winner == null) {
      winner = o;

      const aborts = controllers.filter(x => x[1] !== o).map(x => x[0]);

      for (const ac of aborts) {
        ac.cancel();
      }
    }
  };

  for (const observable of sources) {
    if (observable instanceof Observable) {
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
      onError(new Error('Observable.amb: One of the sources is a non-Observable.'));
      controller.cancel();
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
