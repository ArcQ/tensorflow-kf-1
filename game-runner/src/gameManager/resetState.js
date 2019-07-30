import config from 'config';
import setRandPosF from 'utils/setRandPosF';

export const setRandPos = setRandPosF(config);

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
