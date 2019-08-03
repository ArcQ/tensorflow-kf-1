// import * as rp from 'request-promise';
import { startGame } from 'game-manager/game-adapter';
import { resetState } from 'game-manager/reset-state';
import { listen } from 'ipc/socket-server';
import api from 'api';

export async function runGame(noServer) {
  const fps = 30;
  const game = await startGame(resetState(), () => {}, fps);
  const P1 = game.createPlayer('P1');
  const handleCmd = api.handleCmd(game, { P1 });
  if (noServer) {
    return handleCmd;
  }

  const mainHandler = (res, req) => handleCmd(req)
    .then(data => res.send(data));

  const middleware = [mainHandler];

  listen('train_move', middleware);
  return true;
}
