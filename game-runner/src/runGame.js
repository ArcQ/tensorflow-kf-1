// import * as rp from 'request-promise';
import { startGame } from 'game';
import {} from 'ipc/sockerServer';

async function runGame() {
  const fps = 30;
  const getInitialGameState = () => ({});
  const game = await startGame(getInitialGameState(), () => {}, fps);
  const p1 = game.createPlayer('P1');
  p1.setPos([30, 30]);
  const nextThreeStates = await game.nextTicks(3);
  console.log(nextThreeStates);
}

runGame().then(() => console.log('finished'));
