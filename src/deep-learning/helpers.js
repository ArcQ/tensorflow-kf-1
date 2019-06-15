import * as fs from 'fs';
import config from 'config';

export function saveEpisode(curId, data) {
  fs.writeFile(`../../data/${config.projectId}/${curId}`, data.episdoeActions, (err) => {
    if (err) throw err;
  });
}
