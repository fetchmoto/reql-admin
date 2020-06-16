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
 * Sets the rethinkdb client to the global state for all
 * subscribed components to use.
 */
export const setRethink = rethink => state => {
  return { rethink };
}

/**
 * Sets the documents for a table.
 */
export const setDocuments = documents => state => {
  return { currentTable: { documents: [...documents] } };
}
