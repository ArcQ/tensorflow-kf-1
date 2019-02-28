// const test = require('./build-node/battle_rust.js');
// import('./wasm/battle_rust.js').then((test) => console.log(new test.LevelOne()));
//
import * as rp from 'request-promise';
import * as tf from '@tensorflow/tfjs-node';
import setup from './setup'
import encoder from 'kf-game-engine/build/encoder';
import createWasmGame from 'kf-game-engine/build/wasm-game';
import * as uuid from 'uuid/v4';

let curGame;
const dt = 0.1;
const fs = require('fs');

const initialState = {
  goblin: {
    pos: [100, 100],
  },
  assasin: {
    pos: [200, 200]
  },
  moveTargetCircle: {
    pos: [0, 0],
  },
};

const stacked_frames = 4;
const { encoderKeys, levelOneEncoder } = setup(encoder);
// const curId = uuid();
// fs.writeFile(`./data/${uuid()}`, lyrics, (err) => {
//     // throws an error, you could also catch it here
//     if (err) throw err;
//
//     // success case, the file was saved
//     console.log('Saved Run!');
// });

// function parseLocationAsQuad() {
// }

const newPlayer = (k, onEvent) => ({
  setPos: (x, y) => onEvent([
    levelOneEncoder.encode('MOVE'),
    levelOneEncoder.encode(k),
    x,
    y,
  ])
});

function stateParser(state, stateDiffByte) {
  const spritePosOnChange = {
    P1: (pos) => {
      state.assasin.pos = pos;
    },
    P2: (pos) => {
      state.goblin.pos = pos;
    },
  };
  const stateUpdateHandler = {
    SET_SPRITE_POS: byteData => (encoder) => {
      const pos = byteData.splice(-2);
      const handler = spritePosOnChange[encoder.decode(byteData[0])];
      if (handler) {
        handler(pos);
      }
    },
  };
  return levelOneEncoder.decodeByteArray(stateUpdateHandler)(stateDiffByte);
}

async function runGame() {
  const res = await rp.get('http://localhost:7000/gamemap/generate?x=9&y=16');
  const wasmBindgen = await import('./wasm/battle_rust.js');
  const wasm = await import('./wasm/battle_rust_bg.js');
  let state = initialState;

  const fps = 10;
  const {
    gameLoop,
    wasmInterface,
  } = createWasmGame({
    wasm,
    wasmBindgen,
    onWasmStateChange: (stateDiff) => {
      stateParser(state, stateDiff);
      console.log(state, stateDiff);
    },
    fps,
    wasmConfig: {
      name: 'LevelOne',
      encoderKeys,
      initConfig: { ...JSON.parse(res) },
    },
  });

  global.cljs_wasm_adapter = wasmInterface.fromWasm;

  const tick = () => setTimeout(() => {
    wasmInterface.toWasm.onTick(60 / (fps *1000));
    setTimeout(tick, 0.001)
  }, 0.001);

  tick();

  const onEvent = wasmInterface.toWasm.onEvent;
  const reset = wasmInterface.toWasm.reset;

  const playerOne = newPlayer('P1', onEvent);
  const playerTwo = newPlayer('P2', onEvent);
  setTimeout(() => playerOne.setPos(220, 180), 2000);
  return { state, playerOne, playerTwo, reset };
}

const players = [];
const firstTime = true;

function run() {
  // curGame = runGame();
  const player = players[0];

  if (firstTime) {
    firstTime = false;
    player.model = tf.sequential();

    dino.model.add(tf.layers.dense({
      inputShape:[3],
      activation:'relu',
      units:6
    }));

    dino.model.add(tf.layers.dense({
      inputShape:[6],
      activation:'relu',
      units:2
    }));
  }
}

const config = {
  screenSize: {
    x: 750,
    y: 1334,
  }
};

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function setRandPos() {
  getRandomInt();
}

async function testEnvironment() {
  const { reset, state } = runGame(state);
  // setTimeout(() => console.log(game), 5000);
  const episodes = 10;

  Array(episodes).fill().map((_, i) => {
    if (i > 0) {
      reset();
      state = initialState;
    }
    state = game.get_state()
    img = state.screen_buffer
    misc = state.game_variables
    action = random.choice(actions)
    print(action)
    reward = game.make_action(action)
    print ("\treward:", reward)
    time.sleep(0.02)
    print ("Result:", game.get_total_reward())
    time.sleep(2)
    game.close()
  })
}

runGame();
// game.level_one_dealloc();
