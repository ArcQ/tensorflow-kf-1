import * as tf from '@tensorflow/tfjs-node';
import {
  mean,
  range,
  map,
  scan,
  pipe,
  flatten,
  tail,
  reverse,
  compose,
  pair,
  fromPairs,
  concat,
} from 'ramda';
import { resetState } from 'deep-learning/helpers';
import { std } from 'mathjs';
import config from 'config';
import { getPointF } from '../run-utils';

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

export async function runEpisode(PgNetwork, game) {
  game.reset(resetState);
  const episodeState = [];
  const episodeActions = [];
  const episodeRewards = [];
  let finished = false;
  while (!finished) {
    const { action, scores } = PgNetwork.run(
      tf.tensor(concat(game.state.P1.pos, game.state.P2.pos)),
    );
    // TODO need to calculate reward, maybe by merging in a
    // stream of events after action occured? 500ms?
    const nextPos = getPoint(playerOne.pos, action);
    playerOne.setPos(nextPos);
    finished = game.isEpisodeFinished();
    episodeState.push(state);
    episodeActions.push(action);
    episodeRewards.push(reward);
  }
  return { episodeState, episodeActions, episodeRewards };
}

const objWithKeys = compose(
  map(v => pair(v, [])),
  fromPairs(),
);

const fps = 30;

export function runBatch() {
  const batchData = objWithKeys(['states', 'actions', 'rewards', 'discountedRewards']);
  let batchCount = 0;
  const game = createGame(resetState, fps);
  const playerOne = game.createPlayer('P1');
  const playerTwo = game.createPlayer('P2');

  const PgNetwork = createPgNetwork(config.stateSize, config.actionSize, config.learningRate);
  let episodeNum = 1;

  const getGradientsAndSaveActions = (inputTensor) => {
    const f = () => tf.tidy(() => {
      const [logits, actions] = this.getLogitsAndActions(inputTensor);
      this.currentActions_ = actions.dataSync();
      const labels =
        tf.sub(1, tf.tensor2d(this.currentActions_, actions.shape));
      return tf.losses.sigmoidCrossEntropy(labels, logits).asScalar();
    });
    return tf.variableGrads(f);
  }

  while (batchCount <= config.batchSize) {
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

  return [
    tf.stack(tf.tensor(batchData.states)),
    tf.stack(tf.tensor(batchData.actions)),
    tf.tensor(flatten(batchData.rewards)),
    tf.tensor(flatten(batchData.discountedRewards)),
    episodeNum,
  ];
}
