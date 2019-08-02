import 'babel-polyfill';
import * as rp from 'request-promise';

import { runGame } from './run-game';

jest.mock('request-promise');

const actualStates = [{"P1": {"pos": [198.30291748046875, 198.30291748046875]}, "P2": {"pos": [0, 0]}, "moveTargetCircle": {"pos": [0, 0]}}, {"P1": {"pos": [198.30291748046875, 198.30291748046875]}, "P2": {"pos": [0, 0]}, "moveTargetCircle": {"pos": [0, 0]}}, {"P1": {"pos": [198.30291748046875, 198.30291748046875]}, "P2": {"pos": [0, 0]}, "moveTargetCircle": {"pos": [0, 0]}}]; //eslint-disable-line

test('game can start, and call next tick correctly', async () => {
  rp.get.mockResolvedValue(JSON.stringify({ gameMap: Array(9).fill(Array(16).fill(0)) }));

  const next = await runGame(true);
  const nextThreeStates = await next({
    type: 'move',
    payload: {
      pos: [300, 300],
    },
  });
  expect(typeof nextThreeStates[0].chars.P1.pos[0]).toEqual('number');
  expect(typeof nextThreeStates[0].chars.P1.pos[1]).toEqual('number');
}, 10000);
