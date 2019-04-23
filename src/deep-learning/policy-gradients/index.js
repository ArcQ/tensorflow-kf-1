import {
  mean,
  map,
  scan,
  pipe,
  tail,
  reverse,
  compose,
  fromPairs,
  concat,
  flatten,
} from 'ramda';

import { createGame } from 'game';
import { std } from 'mathjs';
import * as tf from '@tensorflow/tfjs-node';
import { resetState } from 'deep-learning/helpers';

import config from 'config';

import {
  calculateReward,
  getPointF,
  logStatistics,
  pprint,
} from 'deep-learning/run-utils';

import createPgNetwork from './createPgNetwork';

const getPoint = getPointF(config);

export function discountAndNormalizeRewards(rewardsArr, gamma) {
  const normalize = (arr) => {
    const meanReward = mean(arr);
    const stdReward = std(arr);
    return arr.map(v => (v - meanReward) / stdReward);
  };

  return pipe(
    reverse,
    scan(
      (cumulative, episodeReward) =>
        cumulative * gamma + episodeReward,
      0,
    ),
    tail,
    normalize,
    reverse,
    tf.tensor,
  )(rewardsArr);
}

const objWithKeys = compose(
  fromPairs(),
  map(v => [v, []]),
);

export async function runEpisode(runModel, game, players) {
  game.reset(resetState);
  const episodeData = objWithKeys(['actions', 'rewards', 'negLogProbs']);
  const rewardStack = 3;

  while (!game.isEpisodeFinished()
    && episodeData.actions.length < config.maxEpisodeL) {
    const { action, negLogProb } = runModel(
      tf.tensor2d([concat(game.state.P1.pos, game.state.P2.pos)]),
    );
    const nextPos = getPoint(game.state.P1.pos, action);
    players[0].setPos(nextPos);
    const reward = await calculateReward(game, rewardStack, ['P1', 'P2']); //eslint-disable-line
    episodeData.rewards.push(reward);
    episodeData.actions.push(action);
    episodeData.negLogProbs.push(negLogProb);
  }

  return {
    ...episodeData,
    discountedRewards: discountAndNormalizeRewards(episodeData.rewards),
  };
}

export async function runBatch(game, runModel) {
  const batchKeys = ['actions', 'negLogProbs', 'discountedRewards'];
  const batchData = objWithKeys(batchKeys);
  const players = [game.createPlayer('P1'), game.createPlayer('P2')];

  let episodeCount = 1;

  while (flatten(batchData.negLogProbs).length <= config.batchSize) {
    const episodeData = await runEpisode(runModel, game, players); //eslint-disable-line
    batchKeys.map(k =>
      batchData[k].push(episodeData[k]));
    episodeCount += 1;
    game.reset();
  }

  return { batchData, episodeCount };
}

export default async function train() {
  let epoch = 0;
  if (config.type === 'PG') {
    while (epoch < config.numEpochs) {
      const game = await createGame(resetState, config.fps); //eslint-disable-line
      const PgNetwork = createPgNetwork(config);
      const batch = await runBatch(game, PgNetwork.run); //eslint-disable-line
      logStatistics(`games/epoch-${epoch}`, batch.batchData.actions);
      PgNetwork.optimize(batch.batchData.gradients, batch.batchData.discountedRewards);
      pprint({ epoch });
      epoch += 1;
    }
  }
}
