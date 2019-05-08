/**
 * @license
 * MIT License
 *
 * Copyright (c) 2019 Alexis Munsayac
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *
 * @author Alexis Munsayac <alexis.munsayac@gmail.com>
 * @copyright Alexis Munsayac 2019
 */
/**
 * @external {Scheduler} https://lxsmnsyc.github.io/rx-scheduler/
 */
/**
 * @external {Iterable} https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
 */
/**
 * @external {Thennable} https://promisesaplus.com/
 */
/**
 * @external {PromiseLike} https://promisesaplus.com/
 */
/**
 * @external {Cancellable} https://lxsmnsyc.github.io/rx-cancellable/
 */
import { LinkedCancellable } from 'rx-cancellable';
import { isObserver } from './internal/utils';
import {
  amb, ambArray, ambWith, bufferCount,
  bufferTimed, bufferWith, cache, combineLatest, combineLatestArray, combineLatestWith, compose, concat, concatArray,
} from './internal/operators';

/**
 * The Observable class is the non-backpressured, optionally
 * multi-valued base reactive class that offers factory methods,
 * intermediate operators and the ability to consume synchronous
 * and/or asynchronous reactive dataflows.
 *
 * Many operators in the class accept Observable(s), the base
 * reactive interface for such non-backpressured flows, which Observable
 * itself implements as well.
 *
 * The documentation for this class makes use of marble diagrams.
 * The following legend explains these diagrams:
 *
 * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-observable/master/assets/images/legend.png" class="diagram">
 *
 * The Observable follows the protocol
 *
 * <code>onSubscribe onNext* (onError | onComplete)?</code>
 *
 * where the stream can be disposed through the Disposable instance provided
 * to consumers through Observer.onSubscribe.
 *
 * @example
 * let subscription = Observable.just('Hello World')
 *  .delay(1000)
 *  .subscribe(
 *    x => console.log(x),
 *    x => console.error(x),
 *    () => console.log('Done!'),
 *  );
 */
export default class Observable {
  /**
   * @ignore
   */
  constructor(subscribeActual) {
    /**
     * @ignore
     */
    this.subscribeActual = subscribeActual;
  }

  /**
   * Mirrors the one Observable in an Iterable of several
   * Observables that first either emits an item or sends
   * a termination notification.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-observable/master/assets/images/amb.png" class="diagram">
   *
   * @param {!Iterable} sources
   * an Iterable of Observable sources competing to react
   * first. A subscription to each source will occur in the same
   * order as in the Iterable.
   * @returns {Observable}
   * an Observable that emits the same sequence as whichever of
   * the source Observables first emitted an item or sent
   * a termination notification
   */
  static amb(sources) {
    return amb(sources);
  }

  /**
   * Mirrors the one Observable in an array of several
   * Observables that first either emits an item or sends
   * a termination notification.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-observable/master/assets/images/amb.png" class="diagram">
   *
   * @param {!Observable[]} sources
   * an array of Observable sources competing to react first.
   * A subscription to each source will occur in the same order as
   * in the array.
   * @returns {Observable}
   * an Observable that emits the same sequence as whichever of the
   * source Observables first emitted an item or sent a termination
   * notification.
   */
  static ambArray(sources) {
    return ambArray(sources);
  }

  /**
   * Mirrors the Observable (current or provided) that first
   * either emits an item or sends a termination notification.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-observable/master/assets/images/amb.png" class="diagram">
   *
   * @param {!Observable} other
   * an Observable competing to react first. A subscription
   * to this provided source will occur after subscribing to the
   * current source.
   * @returns {Observable}
   * an Observable that emits the same sequence as whichever of
   * the source Observables first emitted an item or sent
   * a termination notification
   */
  ambWith(other) {
    return ambWith(this, other);
  }

  /**
   * Returns an Observable that emits buffers of items it collects
   * from the source Observable. The resulting Observable emits
   * buffers every skip items, each containing count items. When
   * the source Observable completes, the resulting Observable
   * emits the current buffer and propagates the notification from
   * the source Observable. Note that if the source Observable
   * issues an onError notification the event is passed on immediately
   * without first emitting the buffer it is in the process of assembling.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-observable/master/assets/images/buffer4.png" class="diagram">
   *
   * @param {!number} count
   * the maximum size of each buffer before it should be emitted.
   * @param {?number} skip
   * how many items emitted by the source Observable should be skipped
   * before starting a new buffer.
   * @returns {Observable}
   * an Observable that emits buffers for every skip item from the
   * source Observable and containing at most count items
   */
  buffer(count, skip) {
    return bufferCount(this, count, skip);
  }

  /**
   * Returns an Observable that emits buffers of items it collects
   * from the source Observable. The resulting Observable emits
   * connected, non-overlapping buffers, each of a fixed duration
   * specified by the timespan argument and on the specified scheduler.
   * When the source Observable completes, the resulting Observable
   * emits the current buffer and propagates the notification from
   * the source Observable. Note that if the source Observable issues
   * an onError notification the event is passed on immediately without
   * first emitting the buffer it is in the process of assembling.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-observable/master/assets/images/buffer5.s.png" class="diagram">
   *
   * @param {!number} interval
   * the period of time each buffer collects items before it is
   * emitted and replaced with a new buffer
   * @param {?Scheduler} [scheduler==Scheduler.current]
   * the Scheduler to use when determining the end and start of a
   * buffer
   * @returns {Observable}
   * an Observable that emits connected, non-overlapping buffers
   * of items emitted by the source Observable within a fixed
   * duration
   */
  bufferTimed(interval, scheduler) {
    return bufferTimed(this, interval, scheduler);
  }

  /**
   * Returns an Observable that emits non-overlapping buffered items
   * from the source Observable each time the specified boundary
   * Observable emits an item.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-observable/master/assets/images/buffer8.png" class="diagram">
   *
   * Completion of either the source or the boundary Observable causes
   * the returned Observable to emit the latest buffer and complete.
   * If either the source Observable or the boundary Observable issues
   * an onError notification the event is passed on immediately without
   * first emitting the buffer it is in the process of assembling.
   * @param {!Observable} other
   * the boundary Observable
   * @returns {Observable}
   * an Observable that emits buffered items from the source Observable
   * when the boundary Observable emits an item
   */
  bufferWith(other) {
    return bufferWith(this, other);
  }

  /**
   * Returns an Observable that subscribes to this Observable lazily,
   * caches all of its events and replays them, in the same order as
   * received, to all the downstream subscribers.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-observable/master/assets/images/cache.png" class="diagram">
   *
   * This is useful when you want an Observable to cache responses and
   * you can't control the subscribe/dispose behavior of all the Observers.
   *
   * The operator subscribes only when the first downstream subscriber
   * subscribes and maintains a single subscription towards this Observable.
   * In contrast, the operator family of replay() that return a
   * ConnectableObservable require an explicit call to ConnectableObservable.connect().
   *
   * @param {!number} size
   * The maximum number of values the buffer can hold. If the buffer size
   * exceeds the given size, the oldest values are pushed out of the buffer.
   * @returns {Observable}
   * an Observable that, when first subscribed to, caches all of its items
   * and notifications for the benefit of subsequent subscribers.
   */
  cache(size) {
    return cache(this, size);
  }

  /**
   * Combines a collection of source Observables by emitting an item
   * that aggregates the latest values of each of the source Observables
   * each time an item is received from any of the source Observables,
   * where this aggregation is defined by a specified function.
   *
   * If any of the sources never produces an item but only terminates
   * (normally or with an error), the resulting sequence terminates immediately
   * (normally or with all the errors accumulated till that point).
   *
   * If the provided iterable of Observables is empty, the resulting
   * sequence completes immediately without emitting any items and without
   * any calls to the combiner function.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-observable/master/assets/images/combineLatest.png" class="diagram">
   *
   * @param {!Iterable} sources
   * the collection of source Observables
   * @param {?function(arr: Array)} combiner
   * the aggregation function used to combine the items emitted by the source
   * Observables.
   * By default, combines into an array.
   * @returns {Observable}
   * an Observable that emits items that are the result of combining the items
   * emitted by the source Observables by means of the given aggregation
   * function
   */
  static combineLatest(sources, combiner) {
    return combineLatest(sources, combiner);
  }

  /**
   * Combines a collection of source Observables by emitting an item that
   * aggregates the latest values of each of the source Observables each
   * time an item is received from any of the source Observables, where
   * this aggregation is defined by a specified function.
   *
   * If any of the sources never produces an item but only terminates
   * (normally or with an error), the resulting sequence terminates immediately
   * (normally or with all the errors accumulated till that point).
   *
   * If the provided array of Observables is empty, the resulting sequence
   * completes immediately without emitting any items and without any calls to
   * the combiner function.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-observable/master/assets/images/combineLatest.png" class="diagram">
   *
   * @param {!Observable[]} sources
   * the collection of source Observables
   * @param {?function(arr: Array)} combiner
   * the aggregation function used to combine the items emitted by the source
   * Observables
   * By default, combines into an array.
   * @returns {Observable}
   * an Observable that emits items that are the result of combining the items
   * emitted by the source Observables by means of the given aggregation
   * function
   */
  static combineLatestArray(sources, combiner) {
    return combineLatestArray(sources, combiner);
  }

  /**
   * Combines this Observable and a given Observable by emitting an item that
   * aggregates the latest values of each of the Observables each time an item
   * is received from any of the Observables, where this aggregation is defined
   * by a specified function.
   *
   * If any of the Observables never produces an item but only terminates
   * (normally or with an error), the resulting sequence terminates immediately
   * (normally or with all the errors accumulated till that point).
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-observable/master/assets/images/combineLatest.png" class="diagram">
   *
   * @param {!Observable} other
   * The given Observable to be combined with this Observable.
   * @param {?(function(arr: Array))} combiner
   * the aggregation function used to combine the items emitted by the source
   * Observables
   * By default, combines into an array.
   * @returns {Observable}
   * an Observable that emits items that are the result of combining the items
   * emitted by the source Observables by means of the given aggregation
   * function
   */
  combineLatestWith(other, combiner) {
    return combineLatestWith(this, other, combiner);
  }

  /**
   * Transform an Observable by applying a particular transformer function to it.
   *
   * This method operates on the Observable itself whereas lift(operator)
   * operates on the Observable's Observers.
   *
   * If the operator you are creating is designed to act on the individual items
   * emitted by a source ObservableSource, use lift(operator). If your operator
   * is designed to transform the source ObservableSource as a whole (for instance,
   * by applying a particular set of existing RxJava operators to it) use compose.
   * @param {!function(x: Observable): Observable} transformer
   * a function that transforms the source OBservable.
   * @returns {Observable}
   * the source ObservableSource, transformed by the transformer function
   */
  compose(transformer) {
    return compose(this, transformer);
  }

  /**
   * Concatenates elements of each ObservableSource provided via an Iterable sequence
   * into a single sequence of elements without interleaving them.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-observable/master/assets/images/concat.png" class="diagram">
   *
   * @param {!Iterable} sources
   * the Iterable sequence of ObservableSources
   * @returns {Observable}
   */
  static concat(sources) {
    return concat(sources);
  }

  /**
   * Concatenates a variable number of ObservableSource sources.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-observable/master/assets/images/concatArray.png" class="diagram">
   *
   * @param {!Observable[]} sources
   * the array of sources
   * @returns {Observable}
   */
  static concatArray(sources) {
    return concatArray(sources);
  }

  /**
   * @desc
   * Subscribes with an Object that is an Observer.
   *
   * The onSubscribe method is called when subscribeWith
   * or subscribe is executed. This method receives an
   * Cancellable instance.
   *
   * @param {!(Observer)} observer
   * @returns {undefined}
   */
  subscribeWith(observer) {
    if (isObserver(observer)) {
      this.subscribeActual.call(this, observer);
    }
  }

  /**
   * @desc
   * Subscribes to a Observable instance with an onNext
   * and an onError method.
   *
   * onNext receives a non-undefined value.
   * onError receives a string(or an Error object).
   *
   * Both are called once.
   * @param {?function(x: any)} onNext
   * the function you have designed to accept the emission
   * from the Observable
   * @param {?function(x: Error)} onError
   * the function you have designed to accept any error
   * notification from the Observable
   * @param {?function} onComplete
   * the function you have designed to accept the completion
   * from the Observable
   * @returns {Cancellable}
   * an Cancellable reference can request the Observable to cancel.
   */
  subscribe(onNext, onError, onComplete) {
    const controller = new LinkedCancellable();
    this.subscribeWith({
      onSubscribe(ac) {
        controller.link(ac);
      },
      onComplete,
      onNext,
      onError,
    });
    return controller;
  }
}
