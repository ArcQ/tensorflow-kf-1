import { range } from 'ramda';

import { createGame } from 'game';
import { resetState } from 'deep-learning/helpers';
import { runBatch } from 'deep-learning/policy-gradients';
import config from 'config';

import createPgNetwork from 'deep-learning/policy-gradients/createPgNetwork';

function print(data) {
  const divider = range(10).fill('-').join();
  console.info(divider); //eslint-disable-line
  data.entries.map(([k, v]) => console.info(`${k}: ${v}`)); //eslint-disable-line
  console.info(divider); //eslint-disable-line
}

async function train() {
  let epoch = 0;
  if (config.type === 'PG') {
    while (epoch < config.numEpochs) {
      const game = await createGame(resetState, config.fps);
      const PgNetwork = createPgNetwork(config);
      const batch = await runBatch(game, PgNetwork.run);
      PgNetwork.optimize(batch.negLogProbs, batch.discountedRewards);
      print({ epoch });
      epoch += 1;
    }
  }
}

train().then(() => console.info('done'));
