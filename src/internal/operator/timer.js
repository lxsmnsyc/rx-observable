import Observable from '../../observable';
import {
  cleanObserver, isNumber, defaultScheduler,
} from '../utils';
import error from './error';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const {
    onNext, onComplete, onSubscribe,
  } = cleanObserver(observer);

  onSubscribe(this.scheduler.delay(() => {
    onNext(0);
    onComplete();
  }, this.amount));
}
/**
 * @ignore
 */
export default (amount, scheduler) => {
  if (!isNumber(amount)) {
    return error(new Error('Observable.timer: "amount" is not a number.'));
  }
  const observable = new Observable(subscribeActual);
  observable.amount = amount;
  observable.scheduler = defaultScheduler(scheduler);
  return observable;
};
