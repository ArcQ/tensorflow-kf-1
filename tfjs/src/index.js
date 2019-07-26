require("@babel/register")({
  // This will override `node_modules` ignoring - you can alternatively pass
  // an array of strings to be explicitly matched or a regex / glob
  ignore: [],
});

require('babel-polyfill');

console.log();
if (process.argv.slice(2)[0] === 'game') {
  require ('./game/index.js');
} else {
  require('./run/train.js');
}
