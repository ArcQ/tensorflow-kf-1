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
    // tf.layers.batchNormalization({
    //   training: true,
    //   epsilon: 1 ** -5,
    // }),
    // tf.layers.elu(),
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
  learningRate,
  batchSize,
}) {
  const inputLayer = tf.input({ shape: [stateSize] });
  const [lastTrainingLayer, ls] = createTrainingNets(numTrainingNets, inputLayer);

  const fcOne = tf.layers.dense({
    activation: 'relu',
    units: 40,
    inputShape: [4],
    kernelInitializer: 'glorotNormal',
  });

  const logits = tf.layers.dense({
    kernelInitializer: 'glorotNormal',
    inputShape: [40],
    units: actionSize,
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
      // const scores = model.apply(inputs, { training: true });
      // const scores = model.predict(tf.tensor2d([[0,0,0,0]]));
      const f = () => tf.tidy(() => {
        const scores = model.predict(inputs);
        const action = tf.multinomial(scores, 1);
        const a = tf.losses.softmaxCrossEntropy(
          getActionEye(action).squeeze(),
          scores.squeeze(),
        ).asScalar();
        return a;
      });
      const gradients = tf.variableGrads(f);

      return {
        // action,
        // scores,
        gradients,
      };
    },
    optimize(gradients, discountedEpisodeRewards) {
      tf.tidy(() =>
        optimizer.applyGradients(() =>
          tf.mean(tf.mul(
            tf.concat(gradients),
            tf.concat(discountedEpisodeRewards),
          )),
        ));
    },
  };
}
