import {
  scan,
  reduce,
  pipe,
  tail,
  add,
  addIndex,
} from 'ramda';

const reduceIndexed = addIndex(reduce);
const addOne = add(1);

export function choose(choices, distribution) {
  const r = Math.random();
  return pipe(
    scan((acc, curr) => acc + curr, 0),
    tail(),
    reduceIndexed((acc, curr, i) => (r > curr ? i : acc), -1),
    addOne(),
    i => choices[i],
  )(distribution);
}
