import * as tf from '@tensorflow/tfjs-node';

import {
  map,
  mapAccum,
  pipe,
  flatten,
  range,
} from 'ramda';

const NUMBER_TRAINING_NETS = 3;

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
    range(0),
    map(createSet),
    flatten,
    connectLayers(inputLayer),
  )(n);
}

export default function createPgNetwork({ stateSize, actionSize, learningRate }) {
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

  const getActionEye = action => tf.tidy(() => {
    const actionEyes = tf.eye(actionSize);
    return tf.gather(actionEyes, action);
  });

  return {
    run(inputs) {
      const scores = model(inputs);
      return {
        action: tf.multinomial(scores, 1),
        scores,
      };
    },
    optimize(scores, discountedEpisodeRewards, action) {
      tf.tidy(() =>
        optimizer.minimize(() => {
          const negLogProb = tf.losses.softmaxCrossEntropy(getActionEye(action), scores);
          return tf.mean(tf.mul(negLogProb, discountedEpisodeRewards));
        }));
    },
  };
}
