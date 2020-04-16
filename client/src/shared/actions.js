import rClient, { rethinkdb as r } from 'rethinkdb-websocket-client';

export const setTitle = title => state => {
  return { title };
}

/**
 * Set forceReloadKey to a random number.
 * This helps when the navigation needs to re-pull databases
 * and tables.
 */
export const forceReload = () => state => {
  let key = Math.floor((Math.random() * 10000) + 1);
  return { forceReloadKey: key };
}

/**
 * TODO: Figure out a way to possibly turn this into
 * some type of react hook:
 *
 * const reql = useRethink({host, port, path, source})
 */
export const initializeRethink = () => async state => {
  let db = false;
  let connected = false;
  let error = false;

  try {
    db = await rClient.connect({
      host: 'localhost',
      port: 8000,
      path: '/',       // HTTP path to websocket route
      secure: false,     // set true to use secure TLS websockets
    });

    connected = true;
  } catch (err) {
    error = err;
    console.log(err);
  }

  const rethink = {
    client: r,
    connection: db,
    connected,
    error
  };

  return { rethink: { ...rethink } };
}
