import * as fs from 'fs';
import * as net from 'net';

/* eslint-disable no-console */

export function listen(name, onEvent) {
  const server = net.createServer((client) => {
    const chunks = [];
    console.log('client connected');
    client.setEncoding('utf8');

    client.on('end', () => {
      console.log('client disconnected');
    });

    client.on('data', (chunk) => {
      // console.log(`Got data: ${chunk}`);
      chunks.push(chunk);
      if (chunk.match(/\r\n$/)) {
        const cmd = JSON.parse(chunks.join(''));
        onEvent(cmd).then(res => client.write(JSON.stringify(res)));
        // client.write(JSON.stringify({ pong: ping }));
      }
    });
  });

  server.on('listening', () => {
    console.log('Server listening');
  });

  const filePath = `./ipc-${name}.sock`;
  try {
    fs.unlinkSync(filePath);
  } catch (e) { /* new file */ }

  server.listen(filePath);
}

/* eslint-disable no-console */
