import * as tf from '@tensorflow/tfjs-node';

import {
  last,
  map,
  mapAccum,
  pipe,
  flatten,
  range,
  insert,
} from 'ramda';

const NUMBER_TRAINING_NETS = 3;

function connectLayers(inputLayer) {
  return pipe(
    insert(0, inputLayer),
    mapAccum(
      (prevLayer, layer) => {
        const connectedLayer = prevLayer
          ? layer.apply(prevLayer)
          : layer;
        return [connectedLayer, connectedLayer];
      },
      undefined,
    ),
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
    range(0),
    map(createSet),
    flatten,
    connectLayers(inputLayer),
  )(n);
}

export default function createPgNetwork({
  numTrainingNets,
  stateSize,
  actionSize,
  learningRate
}) {
  const inputLayer = tf.input({ shape: [stateSize] });
  const [lastTrainingLayer] = createTrainingNets(numTrainingNets, inputLayer);
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

  const [logitLayer] = connectLayers(lastTrainingLayer)([
    fcOne,
    logits]);

  const model = tf.model({ inputs: inputLayer, outputs: logitLayer });

  const optimizer = tf.train.rmsprop(learningRate);

  const getActionEye = action => tf.tidy(() => {
    const actionEyes = tf.eye(actionSize);
    return tf.gather(actionEyes, action);
  });

  return {
    run(inputs) {
      const scores = model(inputs);
      const negLogProb = tf.losses.softmaxCrossEntropy(getActionEye(action), scores);
      return {
        action: tf.multinomial(scores, 1),
        scores,
        negLogProb,
      };
    },
    optimize(negLogProbs, discountedEpisodeRewards) {
      tf.tidy(() =>
        optimizer.minimize(() => {
          return tf.mean(tf.mul(negLogProbs, discountedEpisodeRewards));
        }));
    },
  };
}
