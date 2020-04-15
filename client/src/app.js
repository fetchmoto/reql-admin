import React, { useEffect } from 'react';
import { useRoutes } from 'hookrouter';
import { subscribe } from 'react-contextual';

import Layout from './layout';
import routes from './routes';

const App = props => {
  const route = useRoutes(routes);

  useEffect(() => {

    // if client is false, initialize rethink
    if (props.rethink.client === false) props.initializeRethink();
  }, []);


  return (<Layout>{route}</Layout>);
}

export default subscribe()(App);
