// const test = require('./build-node/battle_rust.js');
// import('./wasm/battle_rust.js').then((test) => console.log(new test.LevelOne()));
import * as tf from '@tensorflow/tfjs-node';
import { startGame } from './game';

// const fs = require('fs');
const initialState = {
  goblin: {
    pos: [100, 100],
  },
  assasin: {
    pos: [200, 200],
  },
  moveTargetCircle: {
    pos: [0, 0],
  },
};

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

const players = [];
const firstTime = true;

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function setRandPos() {
  getRandomInt();
}

const config = {
  screenSize: {
    x: 750,
    y: 1334,
  },
};

function getPosStateSize() {
  return Object.values(config.screenSize).map((v) => v / 4);
}

const stateSize = getPosStateSize();
// const actionSize = getPosStateSize();
const actionSize = [2];
const learningRate = 0.0001;
const numEpochs = 1000;
const batchSize = 1000; // Each 1 is a timestep (NOT AN EPISODE) # YOU CAN CHANGE TO 5000 if you have GPU
const gamma = 0.99;
const training = false

async function testEnvironment() {
  const fps = 10;
  const onTick = (nextState) => console.log(nextState);
  const { nextTick, createPlayer, reset, state } = await startGame(initialState, onTick, fps);
  nextTick();
  const playerOne = createPlayer('P1');
  const playerTwo = createPlayer('P2');
  setTimeout(() => playerOne.setPos(220, 180), 2000);
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

function makeBatch(batchSize) {
  let states, actions, rewards_of_episode, rewards_of_batch, discounted_rewards = [];

  const episodeNum = 1;
  game.newEpisode();
  state = game.get_state().screen_buffer;
  state, stacked_frames = stack_frames(stacked_frames, state, True);

  // for (let epoch = 0; epoch < 5; epoch++) {
  //   await ds.forEachAsync(({xs, ys}) => {
  //     optimizer.minimize(() => {
  //       const predYs = model(xs);
  //       const loss = tf.losses.softmaxCrossEntropy(ys, predYs);
  //       loss.data().then(l => console.log('Loss', l));
  //       return loss;
  //     });
  //   });
  //   console.log('Epoch', epoch);
  // }

}

testEnvironment();
// game.level_one_dealloc();
