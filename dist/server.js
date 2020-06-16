// Environment configuration
require('dotenv').config();

/**
 * Package requires
 */
const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const app = express();
const wsListen = require('rethinkdb-websocket-server').listen;
const argv = require('yargs').argv;

const loginPage = require('express-login-page');

const loginPageConfig = {
	users: JSON.parse(process.env.ADMIN_USERS),
	sessionMaxAge: (24 * 60 * 60 * 1000),
  redirectPath: '/'
}

const environment = argv.env || process.env.NODE_ENV || 'dev';

// Set the port
const port = process.env.PORT || 8888;

// Create a server that rethinkdb-ws can listen with.
const server = require('http').createServer(app);

/**
 * Only load the build path as a static path
 * if the current environment is production.
 */
if (environment === 'production') {
  app.use(loginPage(loginPageConfig))
  app.use(express.static(path.join(__dirname, 'build')));
}

/**
 * Example of how to do api routes
 */
app.get('/api/ping', function (req, res) {
 return res.send('pongtest');
});

/**
 * Start the rethinkdb support.
 */
wsListen({
  httpServer: server,

  unsafelyAllowAnyQuery: true,

  // HTTP path to listen on, for new ws.Server({path: ...})
  httpPath: process.env.RETHINK_WEBSOCKET_PATH || '/',

  // RethinkDB host to connect to
  dbHost: process.env.RETHINK_DB_HOST || 'localhost',

  // RethinkDB port to connect to
  dbPort: process.env.RETHINK_DB_PORT || 28015,

  // RethinkDB authKey for authenticated connections
  dbAuthKey: process.env.RETHINK_DB_AUTHKEY || null,
});

/**
 * Only accepts the root path if the environment
 * is production.
 */
if (environment === 'production') {
  app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });

  // Redirect any unknown paths to index.html
  app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

server.listen(port, () => {
  console.log(`Listening on ${port}`);
});
