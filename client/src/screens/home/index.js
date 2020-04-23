import React from 'react';
import { subscribe } from 'react-contextual';

const Home = props => {
  return (<div>Home</div>);
}

export default subscribe()(Home);
