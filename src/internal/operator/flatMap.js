import map from './map';
import flatten from './flatten';

/**
 * @ignore
 */
export default (source, mapper) => flatten(map(source, mapper));
