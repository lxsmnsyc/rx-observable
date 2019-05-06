/**
 * @ignore
 */
export default source => new Promise((res, rej) => {
  const result = [];

  source.subscribe(
    x => result.push(x),
    rej,
    () => res(result),
  );
});
