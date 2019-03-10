import * as tf from '@tensorflow/tfjs-node';
import {
  mean,
  map,
  scan,
  pipe,
  flatten,
  tail,
  reverse,
  range,
} from 'ramda';
import { std } from 'mathjs';

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

function createTrainingNets(n) {
  const createNet = () => [
    tf.layers.reLU(),
    tf.layers.batchNormalization({
      training: true,
      epsilon: 1 ** -5,
    }),
    tf.layers.elu(),
  ];
  return pipe(
    range,
    map(createNet),
    flatten,
  )(n);
}

const NUMBER_TRAINING_NETS = 3;

export function PolicyGradientNetwork(stateSize, actionSize, learningRate) {
  const inputs = tf.variable(tf.tensor(inputPlaceholder), false, 'inputs', 'float32');
  const actions = tf.variable(tf.tensor(inputPlaceholder), false, 'actions', 'float32');
  const discountedEpisodeRewards = tf.variable(tf.scalar(0), true, 'discountedEpisodeRewards', 'float32');

  const mean_reward = tf.variable(tf.scalar(0), true, 'meanReward', 'float32');

  const flatten = tf.layers.flatten();

  const fcOne = tf.layers.dense({
    activation: 'elu',
    units: 512,
    kernelInitializer: 'glorotNormal',
  });

  const logits = tf.layers.dense({
    kernelInitializer: 'glorotNormal',
    units: 15,
  });

  const optimizer = tf.train.rmsprop(learningRate);

  const model = tf.sequential();
  const trainingNets = createTrainingNets(NUMBER_TRAINING_NETS);
  [...trainingNets,
    flatten,
    fcOne,
    logits].map(layer => model.add(layer));

  optimizer.minimize(() => {
    const output = model(xs);
    const [xLogits, yLogits, scores] = tf.split(output, 3);

    const actionDistribution = tf.softmax(scores);

    const negLogProb = tf.losses.softmaxCrossEntropy();
    const loss = tf.mean(tf.mul(negLogProb, discountedEpisodeRewards));
    loss.data().then(l => console.log('Loss', l));
    return loss;
  });
}
