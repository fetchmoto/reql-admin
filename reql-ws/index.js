const http = require('http');
const wsListen = require('rethinkdb-websocket-server').listen;
const httpServer = http.createServer();

const port = 8000;

wsListen({
  httpServer: httpServer,
  unsafelyAllowAnyQuery: true
});

httpServer.listen(port, () => {
  console.log(`Listening on ${port}`);
});
