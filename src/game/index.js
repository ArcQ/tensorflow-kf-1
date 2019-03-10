import * as rp from 'request-promise';
import encoder from 'kf-game-engine/build/encoder';
import createWasmGame from 'kf-game-engine/build/wasm-game';
import * as R from 'ramda';

import setup from './shared-resources/setup';

const dt = 0.1;
const { encoderKeys, levelOneEncoder } = setup(encoder);

export const newPlayer = (k, onEvent) => ({
  setPos: (x, y) => onEvent([
    levelOneEncoder.encode('MOVE'),
    levelOneEncoder.encode(k),
    x,
    y,
  ]),
});

function stateParser(state, stateDiffByte) {
  const _state = state;
  const spritePosOnChange = {
    P1: (pos) => {
      _state.assasin.pos = pos;
    },
    P2: (pos) => {
      _state.goblin.pos = pos;
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
  return _state;
}

export async function startGame({ ...state }, onTick, fps) {
  const res = await rp.get('http://localhost:7000/gamemap/generate?x=9&y=16');
  const wasmBindgen = await import('./wasm/battle_rust.js');
  const wasm = await import('./wasm/battle_rust_bg.js');
  let processing = false;
  const {
    wasmInterface,
  } = createWasmGame({
    wasm,
    wasmBindgen,
    onWasmStateChange: (stateDiff) => {
      processing = true;
      R.pipe(
        stateParser,
        onTick,
      )(state, stateDiff);
      processing = false;
    },
    fps,
    wasmConfig: {
      name: 'LevelOne',
      encoderKeys,
      initConfig: { ...JSON.parse(res) },
    },
  });

  global.cljs_wasm_adapter = wasmInterface.fromWasm;

  const nextTick = () => setTimeout(() => {
    if (!processing) {
      wasmInterface.toWasm.onTick(60 / (fps * 1000));
      setTimeout(nextTick, 0);
    } else {
      setTimeout(nextTick, 0.001);
    }
  }, 0);

  const { onEvent, reset } = wasmInterface.toWasm;

  return {
    state,
    createPlayer: k => newPlayer(k, onEvent),
    nextTick,
    reset,
  };
}
