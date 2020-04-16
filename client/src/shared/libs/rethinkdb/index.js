import rClient, { rethinkdb as r } from 'rethinkdb-websocket-client';

const _proto = {

  // Websocket Server Configuration
  host: 'localhost',
  port: 8000,
  path: '/',
  secure: false,

  // Class configuration
  delayedReconnection: 0, // Seconds
  reconnectOnDisconnect: true,


  // RethinkDB
  client: false,
  connection: false,
  error: false,
  connected: false,

  // Custom Events
  events: {},

  async initialize (configuration = {}) {

    /**
     * Class configuration variable checks
     */

    if (configuration.delayedReconnection !== undefined)
      this.delayedReconnection   = configuration.delayedReconnection;

    if (configuration.reconnectOnDisconnect !== undefined)
      this.reconnectOnDisconnect = configuration.reconnectOnDisconnect;

    /**
     * Build the configuration object
     */
    const config = {
      host:   this.host,
      port:   this.port,
      path:   this.path,
      secure: this.secure
    };

    // Attempt to connect
    const connection = await this.connect(config);
    if (!connection) return false;

    // Set the class variables
    this.client = r;
    this.connection = connection;
    this.connected = true;

    // Setup connection events
    this.useEvents();

    return {
      client: this.client,
      connection: this.connection,
      error: this.error,
      connected: this.connected
    };
  },

  async connect (config) {
    try {
      const connection = await rClient.connect({
        host: 'localhost',
        port: 8000,
        path: '/',       // HTTP path to websocket route
        secure: false,     // set true to use secure TLS websockets
      });

      console.log('RethinkDB Connected');

      return connection;
    } catch (error) {
      this.error = error;
    }

    return false;
  },

  reconnect () {
    const self = this;
    const delaySeconds = (this.delayedReconnection * 1000);
    console.log(`Reconnecting in ${delaySeconds} seconds.`);

    setTimeout(() => {

      // Run custom onReconnecting event
      if (typeof self.events.onReconnecting === 'function')
        self.events.onReconnecting();

      self.initialize();
    }, delaySeconds);
  },

  setEvents (events) {
    const self = this;

    if (events.onClose) this.events.onClose = events.onClose;
  },

  useEvents () {
    const self = this;

    this.connection.on('open', () => {
      console.log('Rethink WebSocket Open');

      // Run custom onOpen event
      if (typeof self.events.onOpen === 'function') self.events.onOpen();
    })

    this.connection.on('error', (error) => {
      console.log('Rethink Websocket Error: ', error);
      if (this.reconnectOnDisconnect) self.reconnect();
    })

    this.connection.on('close', () => {
      console.log('RethinkDB disconnected.');
      if (this.reconnectOnDisconnect) self.reconnect();

      // Run custom onClose event
      if (typeof self.events.onClose === 'function') self.events.onClose();
    });
  }

};

export default Object.create(_proto);
