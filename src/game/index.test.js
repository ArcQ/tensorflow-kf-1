import 'babel-polyfill';
import { mean } from 'ramda';
import { resetState } from 'deep-learning/helpers';
import { startGame } from './index';

// this actually requires the entire architecture to be working, it's
// an integration test than a unit test, we didn't make game to be unit test friendly
test('game can start, and call next tick correctly', async () => {
  const fps = 30;
  const game = await startGame(resetState(), () => {}, fps);
  const p1 = game.createPlayer('P1');
  p1.setPos([30, 30]);
  const nextThreeStates = await game.nextTicks(3);
  expect((nextThreeStates)).toEqual(10);
  // expect(mean(nextThreeStates)).toEqual(10);
}, 10000);
