import * as tf from '@tensorflow/tfjs-node';
import {
  mean,
  mapAccum,
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

function connectLayers(inputLayer) {
  return mapAccum(
    (prevLayer, layer) => {
      const connectedLayer = layer.apply(prevLayer);
      return [connectedLayer, connectedLayer];
    },
    inputLayer,
  );
}


function createTrainingNets(n, inputLayer) {
  const createSet = () => [
    tf.layers.reLU(),
    tf.layers.batchNormalization({
      training: true,
      epsilon: 1 ** -5,
    }),
    tf.layers.elu(),
  ];

  return pipe(
    range,
    map(createSet),
    flatten,
    connectLayers(inputLayer),
  )(n);
}

const NUMBER_TRAINING_NETS = 3;

export function createPgNetwork(stateSize, actionSize, learningRate) {
  // const inputs = tf.variable(tf.tensor(inputPlaceholder), false, 'inputs', 'float32');
  // const actions = tf.variable(tf.tensor(inputPlaceholder), false, 'actions', 'float32');
  // const discountedEpisodeRewards = tf.variable(tf.scalar(0), true, 'discountedEpisodeRewards', 'float32');
  // const mean_reward = tf.variable(tf.scalar(0), true, 'meanReward', 'float32');
  const inputLayer = tf.input({ shape: [stateSize] });
  const [lastLayer] = createTrainingNets(NUMBER_TRAINING_NETS, inputLayer);

  const flattenLayer = tf.layers.flatten();

  const fcOne = tf.layers.dense({
    activation: 'elu',
    units: 512,
    kernelInitializer: 'glorotNormal',
  });

  const logits = tf.layers.dense({
    kernelInitializer: 'glorotNormal',
    units: 15,
  });

  const [logitLayer] = connectLayers(lastLayer)([
    flattenLayer,
    fcOne,
    logits]);

  const model = tf.model({ inputs: inputLayer, outputs: logitLayer });

  const optimizer = tf.train.rmsprop(learningRate);

  return {
    train(inputs) {
      const output = model(inputs);
      const [xLogits, yLogits, scores] = tf.split(output, 3);
      return {
        posLogits: tf.stack([xLogits, yLogits]),
        actionDistribution: tf.softmax(scores),
      };
    },
    propagate() {
      optimizer.minimize(() => {
        const output = model();
        const [xLogits, yLogits, scores] = tf.split(output, 3);
        const posLogits = tf.stack([xLogits, yLogits]);

        const actionDistribution = tf.softmax(scores);

        const negLogProb = tf.losses.softmaxCrossEntropy({
          logits: actionDistribution,
          labels: posLogits,
        });
        const loss = tf.mean(tf.mul(negLogProb, discountedEpisodeRewards));
        loss.data().then(l => console.log('Loss', l));
        return loss;
      })
    }
  }
}
