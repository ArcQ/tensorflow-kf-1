import * as rp from 'request-promise';
import { flatten } from 'flat';
import { BehaviorSubject } from 'rxjs';
import wasmBindgen from 'game/wasm/battle_rust';
import {
  take,
  delay,
  toArray,
  tap,
} from 'rxjs/operators';
import encoder from 'kf-utils/dist/wasm/encoder';
import createWasmGame from 'kf-game-engine/dist/wasm-game';
import { ZERO, getDistance } from 'deep-learning/run-utils';

import setup from './shared-resources/setup';

const { encoderKeys, levelOneEncoder } = setup(encoder);

export const newPlayer = (k, onEvent) => ({
  setPos: (x, y) => onEvent([
    levelOneEncoder.encode('MOVE'),
    levelOneEncoder.encode(k),
    x,
    y,
  ]),
});

function stateParser([{ ...state }, stateDiffByte]) {
  const spritePosOnChange = {
    P1: (pos) => {
      state.P1.pos = pos;
    },
    P2: (pos) => {
      state.P2.pos = pos;
    },
  };
  const stateUpdateHandler = {
    SET_SPRITE_POS: byteData => (_encoder) => {
      const pos = byteData.splice(-2);
      const handler = spritePosOnChange[_encoder.decode(byteData[0])];
      if (handler) {
        handler(pos);
      }
    },
  };
  levelOneEncoder.decodeByteArray(stateUpdateHandler)(stateDiffByte);
  return state;
}


export async function startGame({ ...state }, onTick, fps) {
  const res = await rp.get('http://localhost:7000/gamemap/generate?x=9&y=16');

  const gameStateSubject = new BehaviorSubject(state);

  const {
    wasmInterface,
  } = createWasmGame({
    globalOverride: global,
    wasmBindgen,
    onWasmStateChange: (stateDiff) => {
      const curState = gameStateSubject.value;
      const stateObj = [curState, stateDiff];
      onTick(stateObj);
      const nextState = stateParser(stateObj);
      gameStateSubject.next(nextState);
    },
    fps,
    wasmConfig: {
      name: 'LevelOne',
      encoderKeys,
      initConfig: flatten({
        charEntities: state.charEntities,
        map: {
          matrix: JSON.parse(res).gameMap,
          tileH: 65,
          tileW: 65,
        },
      }, { safe: true }),
    },
  });

  const { onEvent, reset } = wasmInterface.toWasm;

  return {
    state,
    createPlayer: k => newPlayer(k, onEvent),
    nextTicks: (n) => {
      // can toPromise, subsribe, apply operators etc.
      const p = gameStateSubject.pipe(
        // delay(5),
        tap(() => wasmInterface.toWasm.onTick(60 / (fps * 1000))),
        take(n),
        toArray(),
      ).toPromise();

      wasmInterface.toWasm.onTick(60 / (fps * 1000));
      return p;
    },
    reset,
  };
}

export async function createGame(resetState, fps) {
  const onTick = () => {};
  const {
    nextTicks,
    createPlayer,
    //reset,
    state,
  } = await startGame(resetState(), onTick, fps);

  const isEpisodeFinished = () => getDistance(state.P1.pos, state.P2.pos) === ZERO;

  return {
    nextTicks,
    createPlayer,
    reset() {
      // this.state = resetState();
      // reset(this.state);
      // reset();
    },
    state,
    isEpisodeFinished,
  };
}
