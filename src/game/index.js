import * as rp from 'request-promise';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  take,
  delay,
  toArray,
  tap,
  share,
} from 'rxjs/operators';
import encoder from 'kf-game-engine/encoder';
import createWasmGame from 'kf-game-engine/wasm-game';
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

function stateParser([state, stateDiffByte]) {
  const _state = state;
  const spritePosOnChange = {
    P1: (pos) => {
      _state.P1.pos = pos;
    },
    P2: (pos) => {
      _state.P2.pos = pos;
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

function createObservable(observerHandler) {
  const obs$ = Observable.create((_observer) => {
    observerHandler.setObserver(_observer);
  }).pipe(tap());

  return {
    obs$,
  };
}

export async function startGame({ ...state }, onTick, fps) {
  const res = await rp.get('http://localhost:7000/gamemap/generate?x=9&y=16');
  const wasmBindgen = await import('./wasm/battle_rust.js');
  const wasm = await import('./wasm/battle_rust_bg.js');

  const observerHandler = {
    observer: undefined,
    setObserver: (observer) => {
      console.log(observer);
      this.observer = observer;
    },
    onWasmStateChange: (stateDiff) => {
      this.observer.next(stateDiff);
    },
  };

  // const { obs$ } = createObservable(observerHandler);
  const gameStateSubject = new BehaviorSubject();

  const wasmStateChange$ = gameStateSubject.pipe(
  );

  const {
    wasmInterface,
  } = createWasmGame({
    wasm,
    wasmBindgen,
    onWasmStateChange: (stateDiff) => {
      const curState = gameStateSubject.value;
      const stateObj = [curState, stateDiff];
      onTick(stateObj);
      gameStateSubject.next(stateObj);
      setTimeout(
        wasmInterface.toWasm.onTick(60 / (fps * 1000)),
        500,
      )
    },
    fps,
    wasmConfig: {
      name: 'LevelOne',
      encoderKeys,
      initConfig: { ...JSON.parse(res) },
    },
  });

  global.cljs_wasm_adapter = wasmInterface.fromWasm;

  const { onEvent, reset } = wasmInterface.toWasm;

  return {
    state,
    createPlayer: k => newPlayer(k, onEvent),
    nextTicks: (n) => {
      // can toPromise, subsribe, apply operators etc.
      const p = gameStateSubject.pipe(
        take(n),
      ).toPromise();

      wasmInterface.toWasm.onTick(60 / (fps * 1000));
      return p;
    },
    reset,
  };
}

export async function createGame(resetState, fps) {
  const onTick = nextState => console.log(nextState);
  const {
    nextTick,
    createPlayer,
    reset,
    state,
  } = await startGame(resetState(), onTick, fps);

  const isEpisodeFinished = () => getDistance(state.P1.pos, state.P2.pos) === ZERO;

  return {
    nextTick,
    createPlayer,
    reset: (resetState) => {
      this.state = resetState();
      reset(this.state);
    },
    state,
    isEpisodeFinished,
  };
  // setInterval(() => console.log(state), 1000);
  // const episodes = 10;
  //
  // Array(episodes).fill().map((_, i) => {
  //   if (i > 0) {
  //     reset();
  //     state = initialState;
  //   }
  //   img = state.screen_buffer;
  //   misc = state.game_variables;
  //   action = random.choice(actions);
  //   print(action);
  //   reward = game.make_action(action);
  //   print('\treward:', reward);
  //   time.sleep(0.02);
  //   print('Result:', game.get_total_reward());
  //   time.sleep(2);
  //   game.close();
  // });
}
