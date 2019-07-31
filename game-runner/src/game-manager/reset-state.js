import config from 'config';
import setRandPosF from 'utils/set-rand-pos-f';

export const setRandPos = setRandPosF(config);

export function resetState() {
  // TODO, state should include whether idle or moving, and if moving, point of movement
  const chars = {
    P1: {
      charK: 'assasin',
      pos: setRandPos(config),
    },
    P2: {
      charK: 'knight',
      pos: setRandPos(config),
    },
  };
  return { chars: { ...chars, keys: Object.keys(chars) } };
}
