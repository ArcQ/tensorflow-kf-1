require('@babel/register')({
  // This will override `node_modules` ignoring - you can alternatively pass
  // an array of strings to be explicitly matched or a regex / glob
  presets: ['@babel/preset-env'],
  ignore: [],
});

require('babel-polyfill');

require('./runGame.js'); //eslint-disable-line
