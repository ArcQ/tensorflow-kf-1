// import * as rp from 'request-promise';
import { startGame } from 'game-manager/game-adapter';
import { resetState } from 'game-manager/reset-state';
import { listen } from 'ipc/socket-server';
import config from 'config';

function handleCmd(game, p1) {
  return async function(cmd, resolve) {
    const ticksToWait = config.fps * (config.reactionTime / 1000);
    switch (cmd.type) {
      case 'move':
        p1.setPos([30, 30]);
        break;
      default:
    }
    const nextStates = await game.nextTicks(ticksToWait);
    console.log(nextStates); //eslint-disable-line
    resolve(nextStates);
  };
}

async function runGame() {
  const fps = 30;
  const game = await startGame(resetState(), () => {}, fps);
  console.log(resetState());
  const p1 = game.createPlayer('P1');
  listen('train_move', handleCmd(game, p1));
}

runGame().then();
