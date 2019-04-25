import { LinkedCancellable } from 'rx-cancellable';
import Observable from '../../observable';
import {
  cleanObserver, isFunction, isNull, isOf,
} from '../utils';

function subscribeActual(observer) {
  const {
    onNext, onComplete, onError, onSubscribe,
  } = cleanObserver(observer);

  const { source, resumeIfError } = this;

  const controller = new LinkedCancellable();

  onSubscribe(controller);

  source.subscribeWith({
    onSubscribe(ac) {
      controller.link(ac);
    },
    onComplete,
    onError(x) {
      let result;

      if (isFunction(resumeIfError)) {
        try {
          result = resumeIfError(x);
          if (isNull(result)) {
            throw new Error('Observable.onErrorResumeNext: returned an non-Observable.');
          }
        } catch (e) {
          onError(new Error([x, e]));
          return;
        }
      } else {
        result = resumeIfError;
      }
      controller.unlink();
      result.subscribeWith({
        onSubscribe(ac) {
          controller.link(ac);
        },
        onComplete,
        onError,
        onNext,
      });
    },
    onNext,
  });
}
/**
 * @ignore
 */
export default (source, resumeIfError) => {
  if (!(isFunction(resumeIfError) || isOf(resumeIfError, Observable))) {
    return source;
  }

  const observable = new Observable(subscribeActual);
  observable.source = source;
  observable.resumeIfError = resumeIfError;
  return observable;
};
