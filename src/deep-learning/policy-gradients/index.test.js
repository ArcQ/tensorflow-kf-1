import 'babel-polyfill';
import * as tf from '@tensorflow/tfjs-node';
import { discountAndNormalizeRewards } from './index';

test('should discount and normalize rewards', async () => {
  const discountedR = await discountAndNormalizeRewards(tf.tensor([4, 3, 5]), 0.9);
  const rewardsArr = await discountedR.array();
  const roundedRewardsArr = rewardsArr.map(v => parseFloat(v.toFixed(4)));

  expect(roundedRewardsArr).toEqual([1.0405, -0.0867, -0.9538]);
});
