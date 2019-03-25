import { range } from 'ramda';

// const test = require('./build-node/battle_rust.js');
// import('./wasm/battle_rust.js').then((test) => console.log(new test.LevelOne()));
import { runBatch } from 'deep-learning/policy-gradients';

const type = 'PG';
const epochs = 1000;

function train() {
  if (type === 'PG') {
    range(epochs).map((epoch) => {
      runBatch();
      console.info(epoch); //eslint-disable-line
    });
  }
}

train();
