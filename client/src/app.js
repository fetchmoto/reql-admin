import React, { useEffect } from 'react';
import { useRoutes } from 'hookrouter';
import { subscribe } from 'react-contextual';

import Layout from './layout';
import routes from './routes';

import rethinkdb from './shared/libs/rethinkdb';

const App = props => {
  const route = useRoutes(routes);

  /**
   * Attempts to initialize the rethinkdb
   * connection and sets it to the global state.
   */
  const startRethink = async () => {
    const res = await rethinkdb.initialize();
    console.log(res);
    if (res.connected === true) props.setRethink(res);
  }

  /**
   * Attempt the rethinkdb connection on mount.
   */
  useEffect(() => {
    startRethink();
  }, []);

  return (<Layout>{route}</Layout>);
}

export default subscribe()(App);
