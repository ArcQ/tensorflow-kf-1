import * as fs from 'fs';
import * as net from 'net';
import { pipe, curry } from 'ramda';

function createResponse(payload) {
  return JSON.stringify({ type: 'cmdResponse', payload });
}

function parseChunks(chunks) {
  return JSON.parse(JSON.parse(chunks.join('')));
}

function runMiddleware(chunks, res, middleware = []) {
  return pipe(
    parseChunks,
    ...middleware.map(m => curry(m)(res)),
  )(chunks);
}

function getResponseObj(client) {
  return {
    send: (response) => {
      client.write(createResponse(response));
      client.write('\n');
    },
  };
}

/* eslint-disable no-console */
/**
 * listen
 *
 * @param name
 * @param middleware
 * @returns {undefined}
 */
export function listen(name, middleware = []) {
  if (middleware.length === 0) return;

  const server = net.createServer((client) => {
    let chunks = [];
    console.log('client connected');
    client.setEncoding('utf8');

    client.on('end', () => {
      console.log('client disconnected');
    });

    client.on('data', (chunk) => {
      chunks.push(chunk);
      if (chunk.match(/\n$/)) {
        runMiddleware(
          chunks,
          getResponseObj(client),
          middleware,
        );
        chunks = [];
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
