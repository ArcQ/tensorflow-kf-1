import {
  range,
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

export function getDistance(d1, d2) {
  const dist = calcDistance(d1, d2);
  if (dist < 200) {
    return D2;
  }
  if (dist < 100) {
    return D1;
  }
  if (dist < 20) {
    return ZERO;
  }
  return FAR;
}

export async function calculateReward(game) {
  const rewardStack = 3;
  await nextTick(rewardStack);
}
