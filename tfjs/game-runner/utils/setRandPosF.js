
function getRandomInt(max, min = 0) {
  return tf.tidy(() => {
    const random = tf.randomUniform([2], min, max, 'int32');
    return random.dataSync()[0];
  });
}

export default function setRandPosF({ screenSizes }) {
  return () => [getRandomInt(screenSizes[0].x), getRandomInt(screenSizes[0].y)];
}
