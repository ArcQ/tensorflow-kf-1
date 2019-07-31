function getRandomInt(max, min = 0) {
  return (min + Math.floor(Math.random() * Math.floor(max - min)));
}

export default function setRandPosF({ screenSize }) {
  return () => [getRandomInt(screenSize[0]), getRandomInt(screenSize[1])];
}
