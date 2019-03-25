import 'babel-polyfill';
import { getPointF, setRandPosF, getRandomInt } from './run-utils';
import config from '../config';

test('getRandomInt returns an int', async () => {
  const int = getRandomInt(1, 5);
  expect(int % 1).toEqual(0);
  expect(int).toBeLessThanOrEqual(5);
  expect(int).toBeGreaterThanOrEqual(1);
});

test('setRandPos should return a point', async () => {
  const pos = setRandPosF(config)();
  expect(pos[0]).not.toBeNaN();
  expect(pos[1]).not.toBeNaN();
});

test('getPointF()', async () => {
  const actionDistance = 15;
  const allowedDirections = 13;
  const curPos = [1, 2];
  const divK = 2;
  expect(
    getPointF({ screenSizes: [[750, 1334]], actionDistance, allowedDirections })(curPos, divK),
  ).toEqual([8.5, 14.9904]);
});
