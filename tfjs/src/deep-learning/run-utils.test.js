import 'babel-polyfill';
import {
  ZERO,
  D1,
  D2,
  FAR,
  getDistance,
  calculateReward,
  getPointF,
  setRandPosF,
  getRandomInt,
} from './run-utils';
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

test('getDistance', async () => {
  expect(
    getDistance([[100, 100], [110, 100]]),
  ).toEqual(ZERO);
  expect(
    getDistance([[150, 150], [200, 200]]),
  ).toEqual(D1);
  expect(
    getDistance([[100, 100], [200, 200]]),
  ).toEqual(D2);
  expect(
    getDistance([[100, 100], [1000, 1000]]),
  ).toEqual(FAR);
});

test('calculateReward', async () => {
  const game = {
    nextTick: jest.fn(() => [{
      P1: { pos: [100, 100] },
      P2: { pos: [200, 200] },
    },
    {
      P1: { pos: [150, 150] },
      P2: { pos: [200, 200] },
    },
    {
      P1: { pos: [200, 190] },
      P2: { pos: [200, 200] },
    }]),
  };
  const rewardStack = 3;
  const charKeys = ['P1', 'P2'];


  const reward = await calculateReward(
    game,
    rewardStack,
    charKeys,
  );

  expect(reward.toFixed(2)).toEqual('648.33');
});
