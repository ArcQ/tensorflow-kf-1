import * as fs from 'fs';
import { setRandPosF } from 'deep-learning/run-utils';
import config from 'config';

export function saveEpisode(curId, data) {
  fs.writeFile(`../../data/${config.projectId}/${curId}`, data.episdoeActions, (err) => {
    if (err) throw err;
  });
}

export const setRandPos = setRandPosF(config);

export function resetState() {
  // TODO, state should include whether idle or moving, and if moving, point of movement
  return {
    goblin: {
      pos: setRandPos(),
    },
    assasin: {
      pos: setRandPos(),
    },
    moveTargetCircle: {
      pos: [0, 0],
    },
  };
}
