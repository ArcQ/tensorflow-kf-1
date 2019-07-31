import {
  range,
} from 'ramda';

import { calcDistance } from './calc-distance';

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
