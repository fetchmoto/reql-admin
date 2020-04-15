import React from 'react';
import './content.scss';

const Content = props => {
  return (
    <div className="content__container">
      {props.children}
    </div>
  );
}

export default Content;
