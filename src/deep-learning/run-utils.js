import {
  range,
  mean,
  sum,
  pipe,
  zip,
  map,
} from 'ramda';
import * as tf from '@tensorflow/tfjs-node';
import { calcDistance } from 'math';

export function getRandomInt(max, min = 0) {
  return tf.tidy(() => {
    const random = tf.randomUniform([2], min, max, 'int32');
    return random.dataSync()[0];
  });
}

export function getPointF({ actionDistance, allowedDirections, screenSizes }) {
  return (curPos, divK) => {
    const rad = ((Math.PI * 2) / (allowedDirections - 1)) * divK;
    const diff = [
      actionDistance * Math.cos(rad),
      actionDistance * Math.sin(rad),
    ];

    const handleLimits = ([v, limit]) => {
      if (v > limit) {
        return limit;
      }
      if (v < 0) {
        return 0;
      }
      return v;
    };

    const newPos = map(
      sum,
      zip(curPos, diff),
    );

    return pipe(
      zip,
      map(v => Number(handleLimits(v).toFixed(4))),
    )(newPos, screenSizes[0]);
  };
}

export function setRandPosF({ screenSizes }) {
  return () => [getRandomInt(screenSizes[0].x), getRandomInt(screenSizes[0].y)];
}

export const [ZERO, D1, D2, FAR] = range(0, 4);

export function getDistance([d1, d2]) {
  const dist = calcDistance(d1, d2);
  if (dist < 20) {
    return ZERO;
  }
  if (dist < 100) {
    return D1;
  }
  if (dist < 200) {
    return D2;
  }
  return FAR;
}

const rewardDict = {
  [ZERO]: 0,
  [D1]: 950,
  [D2]: 995,
  [FAR]: 999,
};

/**
 * calculateReward - game will also tick that number of times in rewardStack
 *
 * @param game
 * @param rewardStack - 3
 * @param keys - ['P1', 'P2']
 * @returns {number}
 */
export async function calculateReward(game, rewardStack, charKeys) {
  const lastThreeStates = await game.nextTicks(rewardStack);
  return pipe(
    map(state => pipe(
      map(charKey => state[charKey].pos),
      getDistance,
      distType => rewardDict[distType],
    )(charKeys)),
    mean,
  )(lastThreeStates);
}
