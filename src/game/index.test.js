import 'babel-polyfill';
import * as rp from 'request-promise';
import { mean } from 'ramda';
import { resetState } from 'deep-learning/helpers';
import { startGame } from './index';

jest.mock('request-promise');

// this actually requires the entire architecture to be working, it's
// an integration test than a unit test, we didn't make game to be unit test friendly
const actualStates = [{"P1": {"pos": [198.30291748046875, 198.30291748046875]}, "P2": {"pos": [0, 0]}, "moveTargetCircle": {"pos": [0, 0]}}, {"P1": {"pos": [198.30291748046875, 198.30291748046875]}, "P2": {"pos": [0, 0]}, "moveTargetCircle": {"pos": [0, 0]}}, {"P1": {"pos": [198.30291748046875, 198.30291748046875]}, "P2": {"pos": [0, 0]}, "moveTargetCircle": {"pos": [0, 0]}}]; //eslint-disable-line
test('game can start, and call next tick correctly', async () => {
  const fps = 10;
  rp.get.mockResolvedValue(JSON.stringify({ gameMap: Array(9).fill(Array(16).fill(0)) }));

  const game = await startGame(resetState(), () => {}, fps);
  const p1 = game.createPlayer('P1');
  p1.setPos([30, 30]);
  const nextThreeStates = await game.nextTicks(3);
  expect(nextThreeStates).toEqual(actualStates);
  // expect(mean(nextThreeStates)).toEqual(10);
}, 10000);
