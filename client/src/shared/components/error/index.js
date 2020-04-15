import React from 'react';
import './error.scss';

const ErrorComponent = () => {
  return (
    <div className="error__container">
      <div className="content">
        <i className="fas fa-exclamation-triangle"></i><br />
        Uh oh! There was an error!
      </div>
    </div>
  );
}

export default ErrorComponent;
