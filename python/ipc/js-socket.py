var net = require('net');

var server = net.createServer(client => {
  const chunks = [];
  console.log(`client connected`);
  client.setEncoding('utf8');

  client.on('end', () => {
    console.log('client disconnected');
  });


  client.on('data', chunk => {
    console.log(`Got data: ${chunk}`);
    chunks.push(chunk)

    if (chunk.match(/\r\n$/)) {
      const {ping} = JSON.parse(chunks.join(''));
      client.write(JSON.stringify({pong: ping}));
    }
  });
});

server.on('listening', () => {
  console.log(`Server listening`);
});
server.listen('/tmp/ipc-example.sock');

/*eslint no-console: false*/
