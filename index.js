'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var AbortController = _interopDefault(require('abort-controller'));

/**
 * @ignore
 */
// eslint-disable-next-line valid-typeof
const isType = (x, y) => typeof x === y;
/**
 * @ignore
 */
const isFunction = x => isType(x, 'function');
/**
 * @ignore
 */
const isNumber = x => isType(x, 'number');
/**
 * @ignore
 */
const isObject = x => isType(x, 'object');
/**
 * @ignore
 */
const isIterable = obj => isObject(obj) && isFunction(obj[Symbol.iterator]);
/**
 * @ignore
 */
const isObserver = obj => isObject(obj) && isFunction(obj.onSubscribe);
/**
 * @ignore
 */
const toCallable = x => () => x;
/**
 * @ignore
 */
function onNextHandler(value) {
  const { onNext, onError, controller } = this;
  if (controller.signal.aborted) {
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
    controller.abort();
  }
}
/**
 * @ignore
 */
function onCompleteHandler() {
  const { onComplete, controller } = this;
  if (controller.signal.aborted) {
    return;
  }
  try {
    onComplete();
  } finally {
    controller.abort();
  }
}
/**
 * @ignore
 */
function onErrorHandler(err) {
  const { onError, controller } = this;
  let report = err;
  if (!(err instanceof Error)) {
    report = new Error('onError called with a non-Error value.');
  }
  if (controller.signal.aborted) {
    return;
  }

  try {
    onError(report);
  } finally {
    controller.abort();
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
const cleanObserver = x => ({
  onSubscribe: x.onSubscribe,
  onNext: isFunction(x.onNext) ? x.onNext : identity,
  onComplete: isFunction(x.onComplete) ? x.onComplete : identity,
  onError: isFunction(x.onError) ? x.onError : throwError,
});
/**
 * @ignore
 */
const immediateError = (o, x) => {
  const { onSubscribe, onError } = cleanObserver(o);
  const controller = new AbortController();
  onSubscribe(controller);

  if (!controller.signal.aborted) {
    onError(x);
    controller.abort();
  }
};

/**
 * @ignore
 */
function subscribeActual(observer) {
  let err;

  try {
    err = this.supplier();

    if (err == null) {
      throw new Error('Observable.error: Error supplier returned a null value.');
    }
  } catch (e) {
    err = e;
  }
  immediateError(observer, err);
}
/**
 * @ignore
 */
var error = (value) => {
  let report = value;

  if (!(value instanceof Error || isFunction(value))) {
    report = new Error('Observable.error received a non-Error value.');
  }

  if (!isFunction(value)) {
    report = toCallable(report);
  }
  const observable = new Observable(subscribeActual);
  observable.supplier = report;
  return observable;
};

/* eslint-disable no-loop-func */

/**
 * @ignore
 */
function subscribeActual$1(observer) {
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
var amb = (sources) => {
  if (!isIterable(sources)) {
    return error(new Error('Observable.amb: sources is not Iterable.'));
  }
  const observable = new Observable(subscribeActual$1);
  observable.sources = sources;
  return observable;
};

/**
 * @ignore
 */
var ambWith = (source, other) => {
  if (!(other instanceof Observable)) {
    return source;
  }
  return amb([source, other]);
};

/**
 * @ignore
 */
var compose = (source, transformer) => {
  if (!isFunction(transformer)) {
    return source;
  }

  let result;

  try {
    result = transformer(source);

    if (!(result instanceof Observable)) {
      throw new Error('Observable.compose: transformer returned a non-Observable.');
    }
  } catch (e) {
    result = error(e);
  }

  return result;
};

/**
 * @ignore
 */
function subscribeActual$2(observer) {
  const {
    onNext, onComplete, onError, onSubscribe,
  } = cleanObserver(observer);

  const emitter = new AbortController();
  emitter.onComplete = onCompleteHandler.bind(this);
  emitter.onError = onErrorHandler.bind(this);
  emitter.onNext = onNextHandler.bind(this);

  this.controller = emitter;
  this.onComplete = onComplete;
  this.onError = onError;
  this.onNext = onNext;

  onSubscribe(emitter);

  try {
    this.subscriber(emitter);
  } catch (ex) {
    emitter.onError(ex);
  }
}
/**
 * @ignore
 */
var create = (subscriber) => {
  if (!isFunction(subscriber)) {
    return error(new Error('Observable.create: There are no subscribers.'));
  }
  const observable = new Observable(subscribeActual$2);
  observable.subscriber = subscriber;
  return observable;
};

/**
 * @ignore
 */
function subscribeActual$3(observer) {
  const {
    onNext, onComplete, onError, onSubscribe,
  } = cleanObserver(observer);

  let result;

  let err;
  try {
    result = this.supplier();
    if (!(result instanceof Observable)) {
      throw new Error('Observable.defer: supplier returned a non-Observable.');
    }
  } catch (e) {
    err = e;
  }

  if (err != null) {
    immediateError(observer, err);
  } else {
    result.subscribeWith({
      onSubscribe,
      onComplete,
      onError,
      onNext,
    });
  }
}
/**
 * @ignore
 */
var defer = (supplier) => {
  const observable = new Observable(subscribeActual$3);
  observable.supplier = supplier;
  return observable;
};

/**
 * @ignore
 */
function subscribeActual$4(observer) {
  const {
    onNext, onComplete, onError, onSubscribe,
  } = cleanObserver(observer);

  const { amount, doDelayError } = this;

  const controller = new AbortController();

  const { signal } = controller;

  onSubscribe(controller);

  if (signal.aborted) {
    return;
  }

  this.source.subscribeWith({
    onSubscribe(ac) {
      signal.addEventListener('abort', () => ac.abort());
    },
    onNext(x) {
      const timeout = setTimeout(() => {
        onNext(x);
      }, amount);

      signal.addEventListener('abort', () => {
        clearTimeout(timeout);
      });
    },
    onComplete() {
      const timeout = setTimeout(() => {
        onComplete();
        controller.abort();
      }, amount);

      signal.addEventListener('abort', () => {
        clearTimeout(timeout);
      });
    },
    onError(x) {
      const timeout = setTimeout(() => {
        onError(x);
        controller.abort();
      }, doDelayError ? 0 : amount);

      signal.addEventListener('abort', () => {
        clearTimeout(timeout);
      });
    },
  });
}
/**
 * @ignore
 */
var delay = (source, amount, doDelayError) => {
  if (!isNumber(amount)) {
    return source;
  }
  const observable = new Observable(subscribeActual$4);
  observable.source = source;
  observable.amount = amount;
  observable.doDelayError = doDelayError;
  return observable;
};

/**
 * @ignore
 */
function subscribeActual$5(observer) {
  const {
    onNext, onComplete, onError, onSubscribe,
  } = cleanObserver(observer);

  const { amount } = this;

  const controller = new AbortController();

  const { signal } = controller;

  onSubscribe(controller);

  if (signal.aborted) {
    return;
  }

  const timeout = setTimeout(() => {
    this.source.subscribeWith({
      onSubscribe(ac) {
        signal.addEventListener('abort', () => ac.abort());
      },
      onComplete() {
        onComplete();
        controller.abort();
      },
      onError(x) {
        onError(x);
        controller.abort();
      },
      onNext,
    });
  }, amount);

  signal.addEventListener('abort', () => {
    clearTimeout(timeout);
  });
}
/**
 * @ignore
 */
var delaySubscription = (source, amount) => {
  if (!isNumber(amount)) {
    return source;
  }
  const observable = new Observable(subscribeActual$5);
  observable.source = source;
  observable.amount = amount;
  return observable;
};

/**
 * @ignore
 */
function subscribeActual$6(observer) {
  const {
    onSubscribe, onNext, onComplete, onError,
  } = cleanObserver(observer);

  const controller = new AbortController();

  onSubscribe(controller);

  const { signal } = controller;

  if (signal.aborted) {
    return;
  }

  const { source, predicate } = this;

  source.subscribeWith({
    onSubscribe(ac) {
      signal.addEventListener('abort', () => ac.abort());
    },
    onComplete() {
      onComplete();
      controller.abort();
    },
    onNext(x) {
      let result;

      try {
        result = predicate(x);
      } catch (e) {
        onError(e);
        controller.abort();
        return;
      }

      if (result) {
        onNext(x);
      }
    },
    onError(x) {
      onError(x);
      controller.abort();
    },
  });
}

/**
 * @ignore
 */
var filter = (source, predicate) => {
  if (!isFunction(predicate)) {
    return source;
  }

  const observable = new Observable(subscribeActual$6);
  observable.source = source;
  observable.predicate = predicate;
  return observable;
};

/* eslint-disable no-restricted-syntax */

function subscribeActual$7(observer) {
  const {
    onNext, onError, onComplete, onSubscribe,
  } = cleanObserver(observer);

  const controller = new AbortController();

  const { values } = this;

  onSubscribe(controller);

  const { signal } = controller;

  for (const x of values) {
    if (signal.aborted) {
      return;
    }
    if (x == null) {
      onError(new Error('Observable.just: attempt to send null value.'));
      controller.abort();
      return;
    }
    onNext(x);
  }
  onComplete();
  controller.abort();
}

var just = (...values) => {
  const observable = new Observable(subscribeActual$7);
  observable.values = values;
  return observable;
};

/**
 * @ignore
 */
function subscribeActual$8(observer) {
  let result;

  try {
    result = this.operator(observer);

    if (!isObserver(result)) {
      throw new Error('Observable.lift: operator returned a non-Observer.');
    }
  } catch (e) {
    immediateError(observer, e);
    return;
  }

  this.source.subscribeWith(result);
}

/**
 * @ignore
 */
var lift = (source, operator) => {
  if (typeof operator !== 'function') {
    return source;
  }

  const observable = new Observable(subscribeActual$8);
  observable.source = source;
  observable.operator = operator;
  return observable;
};

/**
 * @ignore
 */
const defaultMapper = x => x;

/**
 * @ignore
 */
function subscribeActual$9(observer) {
  const {
    onNext, onComplete, onError, onSubscribe,
  } = cleanObserver(observer);

  const { mapper } = this;

  this.source.subscribeWith({
    onSubscribe,
    onNext(x) {
      let result;
      try {
        result = mapper(x);
        if (result == null) {
          throw new Error('Observable.map: mapper function returned a null value.');
        }
      } catch (e) {
        onError(e);
        return;
      }
      onNext(result);
    },
    onComplete,
    onError,
  });
}
/**
 * @ignore
 */
var map = (source, mapper) => {
  let ms = mapper;
  if (!isFunction(mapper)) {
    ms = defaultMapper;
  }

  const observable = new Observable(subscribeActual$9);
  observable.source = source;
  observable.mapper = ms;
  return observable;
};

/* eslint-disable no-loop-func */

/**
 * @ignore
 */
function subscribeActual$a(observer) {
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

  signal.addEventListener('abort', () => controllers.forEach(x => x.abort()));

  let completed = sources.length;

  for (const observable of sources) {
    if (signal.aborted) {
      return;
    }
    if (observable instanceof Observable) {
      observable.subscribeWith({
        onSubscribe(ac) {
          controllers.push(ac);
        },
        onComplete() {
          completed -= 1;
          if (completed === 0) {
            onComplete();
            controller.abort();
          }
        },
        onError(x) {
          onError(x);
          controller.abort();
        },
        onNext,
      });
    } else {
      onError(new Error('Observable.merge: One of the sources is a non-Observable.'));
      controller.abort();
      break;
    }
  }
}
/**
 * @ignore
 */
var merge = (sources) => {
  if (!isIterable(sources)) {
    return error(new Error('Observable.merge: sources is not Iterable.'));
  }
  const observable = new Observable(subscribeActual$a);
  observable.sources = sources;
  return observable;
};

/* eslint-disable no-loop-func */

/**
 * @ignore
 */
function subscribeActual$b(observer) {
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

  signal.addEventListener('abort', () => controllers.forEach(x => x.abort()));

  let completed = sources.length;

  const errors = [];

  for (const observable of sources) {
    if (signal.aborted) {
      return;
    }
    if (observable instanceof Observable) {
      observable.subscribeWith({
        onSubscribe(ac) {
          controllers.push(ac);
        },
        onComplete() {
          completed -= 1;
          if (completed === 0) {
            if (errors.length === 0) {
              onComplete();
            } else {
              onError(errors);
            }
            controller.abort();
          }
        },
        onError(x) {
          errors.push(x);
          completed -= 1;
          if (completed === 0) {
            onError(errors);
            controller.abort();
          }
        },
        onNext,
      });
    } else {
      onError(new Error('Observable.mergeDelayError: One of the sources is a non-Observable.'));
      controller.abort();
      break;
    }
  }
}
/**
 * @ignore
 */
var mergeDelayError = (sources) => {
  if (!isIterable(sources)) {
    return error(new Error('Observable.mergeDelayError: sources is not Iterable.'));
  }
  const observable = new Observable(subscribeActual$b);
  observable.sources = sources;
  return observable;
};

/**
 * @ignore
 */
var mergeWith = (source, other) => {
  if (!(other instanceof Observable)) {
    return source;
  }
  return merge([source, other]);
};

/* eslint-disable class-methods-use-this */

const SIGNAL = {
  aborted: false,
  addEventListener: () => {},
  removeEventListener: () => {},
  onabort: () => {},
};


const CONTROLLER = {
  signal: SIGNAL,
  abort: () => {},
};

/**
 * @ignore
 */
function subscribeActual$c(observer) {
  observer.onSubscribe(CONTROLLER);
}
/**
 * @ignore
 */
let INSTANCE;
/**
 * @ignore
 */
var never = () => {
  if (typeof INSTANCE === 'undefined') {
    INSTANCE = new Observable(subscribeActual$c);
    INSTANCE.subscribeActual = subscribeActual$c.bind(INSTANCE);
  }
  return INSTANCE;
};

function subscribeActual$d(observer) {
  const {
    onSubscribe, onNext, onError, onComplete,
  } = cleanObserver(observer);

  const controller = new AbortController();

  onSubscribe(controller);

  const { signal } = controller;

  if (signal.aborted) {
    return;
  }

  const { source, amount } = this;

  let count = 0;

  source.subscribeWith({
    onSubscribe(ac) {
      signal.addEventListener('abort', () => ac.abort());
    },
    onComplete() {
      onComplete();
      controller.abort();
    },
    onError(x) {
      onError(x);
      controller.abort();
    },
    onNext(x) {
      count += 1;
      if (count <= amount) {
        onNext(x);
      } else {
        onComplete();
        controller.abort();
      }
    },
  });
}

var take = (source, amount) => {
  if (!isNumber(amount)) {
    return source;
  }
  const observable = new Observable(subscribeActual$d);
  observable.amount = amount;
  observable.source = source;
  return observable;
};

function subscribeActual$e(observer) {
  const {
    onSubscribe, onNext, onError, onComplete,
  } = cleanObserver(observer);

  const controller = new AbortController();

  onSubscribe(controller);

  const { signal } = controller;

  if (signal.aborted) {
    return;
  }

  const { source, amount } = this;

  const buffer = [];

  source.subscribeWith({
    onSubscribe(ac) {
      signal.addEventListener('abort', () => ac.abort());
    },
    onComplete() {
      // eslint-disable-next-line no-restricted-syntax
      for (const i of buffer) {
        onNext(i);
      }
      onComplete();
      controller.abort();
    },
    onError(x) {
      onError(x);
      controller.abort();
    },
    onNext(x) {
      buffer.push(x);
      if (buffer.length > amount) {
        buffer.shift();
      }
    },
  });
}

var takeLast = (source, amount) => {
  if (!isNumber(amount)) {
    return source;
  }
  const observable = new Observable(subscribeActual$e);
  observable.amount = amount;
  observable.source = source;
  return observable;
};

function subscribeActual$f(observer) {
  const {
    onSubscribe, onNext, onError, onComplete,
  } = cleanObserver(observer);

  const controller = new AbortController();

  onSubscribe(controller);

  const { signal } = controller;

  if (signal.aborted) {
    return;
  }

  const { source, amount } = this;

  const timer = setTimeout(() => {
    onComplete();
    controller.abort();
  }, amount);

  signal.addEventListener('abort', () => clearTimeout(timer));
  source.subscribeWith({
    onSubscribe(ac) {
      signal.addEventListener('abort', () => ac.abort());
    },
    onComplete() {
      onComplete();
      controller.abort();
    },
    onError(x) {
      onError(x);
      controller.abort();
    },
    onNext,
  });
}

var takeTimed = (source, amount) => {
  if (!isNumber(amount)) {
    return source;
  }
  const observable = new Observable(subscribeActual$f);
  observable.amount = amount;
  observable.source = source;
  return observable;
};

/* eslint-disable import/no-cycle */

class Observable {
  /**
   * @ignore
   */
  constructor(subscribeActual) {
    this.subscribeActual = subscribeActual;
  }

  static amb(sources) {
    return amb(sources);
  }

  ambWith(other) {
    return ambWith(this, other);
  }

  static create(subscriber) {
    return create(subscriber);
  }

  compose(transformer) {
    return compose(this, transformer);
  }

  static defer(supplier) {
    return defer(supplier);
  }

  delay(amount, doDelayOnError) {
    return delay(this, amount, doDelayOnError);
  }

  delaySubscription(amount) {
    return delaySubscription(this, amount);
  }

  filter(predicate) {
    return filter(this, predicate);
  }

  static just(...values) {
    return just(...values);
  }

  lift(operator) {
    return lift(this, operator);
  }

  map(mapper) {
    return map(this, mapper);
  }

  static merge(sources) {
    return merge(sources);
  }

  static mergeDelayError(sources) {
    return mergeDelayError(sources);
  }

  mergeWith(other) {
    return mergeWith(this, other);
  }

  static never() {
    return never();
  }

  take(amount) {
    return take(this, amount);
  }

  takeLast(amount) {
    return takeLast(this, amount);
  }

  takeTimed(amount) {
    return takeTimed(this, amount);
  }

  /**
   * @desc
   * Subscribes with an Object that is an Observer.
   *
   * An Object is considered as an Observer if:
   *  - if it has the method onSubscribe
   *  - if it has the method onComplete (optional)
   *  - if it has the method onNext (optional)
   *  - if it has the method onError (optional)
   *
   * The onSubscribe method is called when subscribeWith
   * or subscribe is executed. This method receives an
   * AbortController instance.
   *
   * @param {!Object} observer
   * @returns {undefined}
   */
  subscribeWith(observer) {
    if (isObserver(observer)) {
      this.subscribeActual.call(this, observer);
    }
  }

  /**
   * @desc
   * Subscribes to a Maybe instance with an onNext
   * and an onError method.
   *
   * onNext receives a non-undefined value.
   * onError receives a string(or an Error object).
   *
   * Both are called once.
   * @param {?function(x: any)} onNext
   * the function you have designed to accept the emission
   * from the Maybe
   * @param {?function(x: any)} onComplete
   * the function you have designed to accept the completion
   * from the Maybe
   * @param {?function(x: any)} onError
   * the function you have designed to accept any error
   * notification from the Maybe
   * @returns {AbortController}
   * an AbortController reference can request the Maybe to abort.
   */
  subscribe(onNext, onComplete, onError) {
    const controller = new AbortController();
    let once = false;
    this.subscribeWith({
      onSubscribe(ac) {
        ac.signal.addEventListener('abort', () => {
          if (!once) {
            once = true;
            if (!controller.signal.aborted) {
              controller.abort();
            }
          }
        });
        controller.signal.addEventListener('abort', () => {
          if (!once) {
            once = true;
            if (!ac.signal.aborted) {
              ac.abort();
            }
          }
        });
      },
      onComplete,
      onError,
      onNext,
    });
    return controller;
  }
}

/**
 * @interface
 * Represents an object that receives notification to
 * an Observer.
 *
 * Emitter is an abstraction layer of the Observer
 */

/**
 * @interface
 * Represents an object that receives notification from
 * an Emitter.
 */

/* eslint-disable no-unused-vars */

module.exports = Observable;
