import * as actions from './actions';

export default {
  title: 'ReQL Admin',

  rethink: {
    client: false,
    connected: false,
    error: false
  },

  ...actions
};
