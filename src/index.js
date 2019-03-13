// const test = require('./build-node/battle_rust.js');
// import('./wasm/battle_rust.js').then((test) => console.log(new test.LevelOne()));
import * as tf from '@tensorflow/tfjs-node';
import { map, pair, fromPair, concat, range, flatten } from 'ramda';
import { discountAndNormalizeRewards } from 'deep-learning/policy-gradients';
import { choose, calcDistance } from 'math';

import { startGame } from './game';

// const fs = require('fs');

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
const training = false;

const [ZERO, D1, D2, FAR] = range(4);

function getDistance(d1, d2) {
  const dist = calcDistance(d1, d2);
  if (dist < 200) {
    return D2;
  }
  if (dist < 100) {
    return D1;
  }
  if (dist < 20) {
    return ZERO;
  }
  return FAR;
}

async function createGame() {
  const fps = 10;
  const onTick = nextState => console.log(nextState);
  const {
    nextTick,
    createPlayer,
    reset,
    state,
  } = await startGame(initialState, onTick, fps);
  nextTick();
  const playerOne = createPlayer('P1');
  const playerTwo = createPlayer('P2');
  setTimeout(() => playerOne.setPos(220, 180), 2000);

  const isEpisodeFinished = () => getDistance(state.assasin.pos, state.goblin.pos) === ZERO;

  return {
    nextTick,
    createPlayer,
    reset,
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

function createInitialState() {
  // TODO, state should include whether idle or moving, and if moving, point of movement
  return {
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
}

function runEpisode(PgNetwork, game) {
  const state = createInitialState();
  const episodeState = [];
  const episodeActions = [];
  const episodeRewards = [];
  let finished = false;
  while (!finished) {
    const { actionDistribution, posLogits } = PgNetwork.train(
      tf.tensor(concat(state.assasin.pos, state.goblin.pos)),
    );
    const action = choose(posLogits, actionDistribution);
    // TODO need to calculate reward, maybe by merging in a stream of events after action occured? 500ms?
    const reward = game.makeAction(action);
    finished = game.isEpisodeFinished();
    episodeState.push(state);
    episodeActions.push(action);
    episodeRewards.push(reward);
  }
  return { episodeState, episodeActions, episodeRewards };
}

const objWithKeys = compose(
  map((v) => pair(v, [])),
  fromPair(),
);

function runBatch(batchSize) {
  const batchData = objWithKeys(['states', 'actions', 'rewards', 'discountedRewards']);
  let batchCount = 0;
  const game = createGame();
  const PgNetwork = createPgNetwork(stateSize, actionSize, learningRate);
  let episodeNum = 1;
  game.reset();

  while (batchCount <= batchSize) {
    const { episodeStates, episodeActions, episodeRewards } = runEpisode(PgNetwork, game);
    batchData.states.push(episodeStates);
    batchData.rewards.push(episodeRewards);
    batchCount += tf.size(episodeRewards);
    batchData.discountedRewards.push(
      discountAndNormalizeRewards(episodeRewards),
    );
    episodeNum += 1;
    game.reset();
  }


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

  return [
    tf.stack(tf.tensor(batchData.states)),
    tf.stack(tf.tensor(batchData.actions)),
    tf.tensor(flatten(batchData.rewards)),
    tf.tensor(flatten(batchData.discountedRewards)),
    episodeNum,
  ];
}

testEnvironment();
// game.level_one_dealloc();
