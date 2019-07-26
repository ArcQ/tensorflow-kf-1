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

// DEPREUCATED can use tfjs.random
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

export function calcDistance(pos1, pos2) {
  return Math.sqrt(
    ((pos1[0] - pos2[0]) ** 2) + ((pos1[1] - pos2[1]) ** 2),
  );
}

/**
 * getDivisions
 *
 * @param {int} divisions how many divisions per quadrant
 * @returns {int}
 */
export function getDivisions(divisions) {
  return (divisions * 4) + 4;
}
