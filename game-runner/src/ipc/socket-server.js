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
        const runAction = new Promise(resolve => onEvent(cmd, resolve));
        runAction()
          .then(res => client.write(JSON.stringify(res)));
        // client.write(JSON.stringify({ pong: ping }));
      }
    });
  });

  server.on('listening', () => {
    console.log('Server listening');
  });
  server.listen(`/tmp/ipc-${name}.sock`);
}

/* eslint-disable no-console */
