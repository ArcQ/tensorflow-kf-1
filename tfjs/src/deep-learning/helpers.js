import * as fs from 'fs';

export function saveEpisode(curId, data) {
  fs.writeFile(`../../data/${config.projectId}/${curId}`, data.episdoeActions, (err) => {
    if (err) throw err;
  });
}
