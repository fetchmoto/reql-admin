const http = require('http');
const wsListen = require('rethinkdb-websocket-server').listen;
const argv = require('yargs').argv;
const httpServer = http.createServer();

const port = argv.port ? argv.port : 8000;

/**
 * @TODO
 * Create an authentication layer for the frontend.
 * Right now, anyone could have access to this socket server.
 */

wsListen({
  httpServer: httpServer,
  unsafelyAllowAnyQuery: true
});

httpServer.listen(port, () => {
  console.log(`Listening on ${port}`);
});
