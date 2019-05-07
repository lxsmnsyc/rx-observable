
/**
 * @ignore
 */
export default source => new Promise((res, rej) => {
  let last;
  source.subscribe(
    (x) => {
      last = x;
    },
    rej,
    () => res(last),
  );
});
