import {
  mean,
  map,
  scan,
  pipe,
  tail,
  reverse,
  compose,
  pair,
  fromPairs,
  concat,
} from 'ramda';
import { std } from 'mathjs';
import * as tf from '@tensorflow/tfjs-node';
import { resetState } from 'deep-learning/helpers';

import config from 'config';

import { calculateReward, getPointF } from '../run-utils';

const getPoint = getPointF(config);

export async function discountAndNormalizeRewards(episodeRewards, gamma) {
  const normalize = (arr) => {
    const meanReward = mean(arr);
    const stdReward = std(arr);
    return arr.map(v => (v - meanReward) / stdReward);
  };
  const rewardsArr = await episodeRewards.array();

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
  map(v => pair(v, [])),
  fromPairs(),
);

export async function runEpisode(runModel, game, players) {
  game.reset(resetState);
  const episodeData = objWithKeys(['actions', 'rewards', 'negLogProbs']);
  const rewardStack = 3;
  const maxEpisodeL = 500;

  while (!game.isEpisodeFinished()
    && episodeData.actions.length < maxEpisodeL) {
    const { action, negLogProb } = runModel(
      tf.tensor(concat(game.state.P1.pos, game.state.P2.pos)),
    );
    const nextPos = getPoint(game.state.P1.pos, action);
    players[0].setPos(nextPos);
    const reward = await calculateReward(game, rewardStack, ['P1', 'P2']); //eslint-disable-line
    episodeData.actions.push(action);
    episodeData.negLogProbs.push(negLogProb);
  }

  return {
    ...episodeData,
    discountedRewards: discountAndNormalizeRewards(episodeData.rewards),
  };
}

export async function runBatch(game, runModel) {
  const batchData = objWithKeys(['actions', 'discountedRewards', 'negLogProbs']);
  console.log(game);
  const players = [game.createPlayer('P1'), game.createPlayer('P2')];

  let episodeCount = 1;

  while (concat(batchData.negLogProbs).length <= config.batchSize) {
    const episodeData = await runEpisode(runModel, game, players);
    ['states', 'negLogProbs', 'discountedRewards'].map(k =>
      batchData[k].push(episodeData[k]));
    episodeCount += 1;
    game.reset();
  }

  return { batchData, episodeCount };
}
