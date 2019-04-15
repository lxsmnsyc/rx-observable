import { BooleanCancellable } from "rx-cancellable";

/**
 * @ignore
 */
// eslint-disable-next-line valid-typeof
const isType = (x, y) => typeof x === y;
/**
 * @ignore
 */
export const isFunction = x => isType(x, 'function');
/**
 * @ignore
 */
export const isNumber = x => isType(x, 'number');
/**
 * @ignore
 */
export const isObject = x => isType(x, 'object');
/**
 * @ignore
 */
export const isIterable = obj => isObject(obj) && isFunction(obj[Symbol.iterator]);
/**
 * @ignore
 */
export const isObserver = obj => isObject(obj) && isFunction(obj.onSubscribe);
/**
 * @ignore
 */
export const toCallable = x => () => x;
/**
 * @ignore
 */
export const isPromise = (obj) => {
  if (obj == null) return false;
  if (obj instanceof Promise) return true;
  return (isObject(obj) || isFunction(obj)) && isFunction(obj.then);
};
/**
 * @ignore
 */
export function onNextHandler(value) {
  const { onNext, onError, controller } = this;
  if (controller.cancelled) {
    return;
  }
  try {
    if (value == null) {
      throw new Error('onNext called with null value.');
    } else {
      onNext(value);
    }
  } catch (e) {
    onError(e);
    controller.cancel();
  }
}
/**
 * @ignore
 */
export function onCompleteHandler() {
  const { onComplete, controller } = this;
  if (controller.cancelled) {
    return;
  }
  try {
    onComplete();
  } finally {
    controller.cancel();
  }
}
/**
 * @ignore
 */
export function onErrorHandler(err) {
  const { onError, controller } = this;
  let report = err;
  if (!(err instanceof Error)) {
    report = new Error('onError called with a non-Error value.');
  }
  if (controller.cancelled) {
    return;
  }

  try {
    onError(report);
  } finally {
    controller.cancel();
  }
}
/**
 * @ignore
 */
const identity = x => x;
/**
 * @ignore
 */
const throwError = (x) => { throw x; };
/**
 * @ignore
 */
export const cleanObserver = x => ({
  onSubscribe: x.onSubscribe,
  onComplete: isFunction(x.onComplete) ? x.onComplete : identity,
  onError: isFunction(x.onError) ? x.onError : throwError,
  onNext: isFunction(x.onNext) ? x.onNext : identity,
});
/**
 * @ignore
 */
export const immediateComplete = (o) => {
  // const disposable = new SimpleDisposable();
  const { onSubscribe, onComplete } = cleanObserver(o);
  const controller = new BooleanCancellable();
  onSubscribe(controller);

  if (!controller.cancelled) {
    onComplete();
    controller.cancel();
  }
};
/**
 * @ignore
 */
export const immediateError = (o, x) => {
  const { onSubscribe, onError } = cleanObserver(o);
  const controller = new BooleanCancellable();
  onSubscribe(controller);

  if (!controller.cancelled) {
    onError(x);
    controller.cancel();
  }
};
