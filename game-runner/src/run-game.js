// import * as rp from 'request-promise';
import { startGame } from 'game-manager/game-adapter';
import { resetState } from 'game-manager/reset-state';
import { listen } from 'ipc/socket-server';
import api from 'api';

export async function runGame(noServer) {
  const fps = 30;
  const game = await startGame(resetState(), () => {}, fps);
  const p1 = game.createPlayer('P1');
  if (noServer) {
    return api.handleCmd(game, p1);
  }
  listen('train_move', api.handleCmd(game, p1));
  return true;
}
