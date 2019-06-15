import * as rp from 'request-promise';
import { resetState } from 'deep-learning/helpers';
import { startGame } from 'game';

// this actually requires the entire architecture to be working, it's
// an integration test than a unit test, we didn't make game to be unit test friendly
const fps = 10;
async function test() {
  const game = await startGame(resetState(), () => {}, fps);
  const p1 = game.createPlayer('P1');
  p1.setPos([30, 30]);
  const nextThreeStates = await game.nextTicks(3);
  console.log(nextThreeStates);
}

test().catch((e) => console.log(e));
