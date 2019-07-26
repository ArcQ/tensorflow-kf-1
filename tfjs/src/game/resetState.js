import { merge } from 'ramda';
import config from 'config';
import setRandPosF from 'deep-learning/run-utils';

export const setRandPos = setRandPosF(config);
// taken straight from kf1, maybe we should consider putting it into
// lib as this gets more complicated
function getInitialGameState() {
  const createCharConfig = (game, render) => ({ game, render });
  const charProps = {
    P1: createCharConfig({
      charK: 'assasin',
    }, {
      pos: [100, 100],
    }),
    P2: createCharConfig({
      charK: 'knight',
    }, {
      pos: [200, 200],
    }),
  };

  const getCombinedProps = _charProps => Object.entries(_charProps)
    .reduce((prev, [k, props]) => ({
      ...prev,
      [k]: merge(props.game, props.render),
    }), {});

  const initialGameState = {
    charEntities: getCombinedProps(charProps),
    moveTargetCircle: {
      isShow: false,
      pos: [100, 100],
    },
  };

  return initialGameState;
}

export function resetState() {
  // TODO, state should include whether idle or moving, and if moving, point of movement
  return {
    P1: {
      pos: setRandPos(),
    },
    P2: {
      pos: setRandPos(),
    },
    moveTargetCircle: {
      pos: [0, 0],
    },
  };
}
