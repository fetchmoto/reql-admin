import rClient, { rethinkdb as r } from 'rethinkdb-websocket-client';

export const setTitle = title => state => {
  return { title };
}

export const forceReload = () => state => {
  let key = Math.floor((Math.random() * 10000) + 1);
  return { forceReloadKey: key };
}

export const initializeRethink = () => async state => {
  let db = false;
  let connected = false;
  let connection = null;
  let error = false;

  try {
    db = await rClient.connect({
      host: 'localhost',
      port: 8000,
      path: '/',       // HTTP path to websocket route
      secure: false,     // set true to use secure TLS websockets
    });

    console.log('Connected');

    connected = true;
    connection = db;
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
