import rClient, { rethinkdb as r } from 'rethinkdb-websocket-client';

const _proto = {

  // Websocket Server Configuration
  path: '/rethink',
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

  /**
   * Initializes a connection to a
   * rethinkdb-websocket-server.
   */
  async initialize (configuration = {}) {

    /**
     * @TODO
     *
     * Add user authentication logic in this websocket connection.
     * We don't want the ability to just hop right in to this client
     * with out some type of authentication unless it's an option
     * set by the admin/developer.
     */

    /**
     * Class configuration variable checks
     */

    if (configuration.delayedReconnection !== undefined)
      this.delayedReconnection   = configuration.delayedReconnection;

    if (configuration.reconnectOnDisconnect !== undefined)
      this.reconnectOnDisconnect = configuration.reconnectOnDisconnect;


    const locationParts = window.location.host.split(":");
    let host = locationParts[0];
    let port = process.env.REACT_APP_SERVER_PORT || locationParts[1] || 80;

    /**
     * Build the configuration object
     */
    const config = {
      host:   host,
      port:   port,
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

  /**
   * The actual connection is made here and
   * returned.
   */
  async connect (config) {
    try {
      const connection = await rClient.connect({
        host: config.host,
        port: config.port,
        path: config.path,
        secure: config.secure
      });

      console.log('RethinkDB Connected');

      return connection;
    } catch (error) {
      console.log(error);
      this.error = error;
    }

    return false;
  },

  /**
   * Attempts a reconnect to the websocket-server if
   * the connection is dropped after the specifed amount
   * of seconds in the configuration.
   */
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

  /**
   * Set custom events
   */
  setEvents (events) {
    const self = this;

    if (events.onClose) this.events.onClose = events.onClose;
  },

  /**
   * Activates events for the connection.
   */
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
