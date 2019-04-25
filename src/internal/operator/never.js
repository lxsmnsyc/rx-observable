/* eslint-disable class-methods-use-this */
import { UNCANCELLED } from 'rx-cancellable';
import Observable from '../../observable';

/**
 * @ignore
 */
let INSTANCE;
/**
 * @ignore
 */
export default () => {
  if (typeof INSTANCE === 'undefined') {
    INSTANCE = new Observable(observer => observer.onSubscribe(UNCANCELLED));
  }
  return INSTANCE;
};
