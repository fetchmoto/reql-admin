import React, { useState, useEffect } from 'react';
import { subscribe } from 'react-contextual';

import Home from './screens/home';
import Table from './screens/table';

const routes = {
  '/': () => <Home />,
  '/database/:database/table/:table': ({database, table}) => <Table database={database} table={table} />
};
export default routes;
