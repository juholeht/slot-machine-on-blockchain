import {
  React, useEffect,
} from 'react';

import Typed from 'typed.js';
import Button from '@mui/material/Button';

import PropTypes from 'prop-types';

import './instructions.css';

const WEB_LOADING = 'Connect Web3 wallet and start playing.';

const LoadingWeb3 = ({ onConnect }) => {
  useEffect(() => {
    const typed = new Typed('#typed', {
      stringsElement: '#web3-instructions',
      typeSpeed: 20,
      loop: false,
    });
    typed.start();
  }, []);

  return (
    <div id="web3-connect">
      <div className="instruction-content">
        <div id="web3-instructions" className="instructions">
          <p>
            {WEB_LOADING}
          </p>
        </div>
        <span id="typed" className="instructions" />
      </div>
      <div>
        <Button id="web3-connect-button" onClick={onConnect} variant="contained" size="large">Connect</Button>
      </div>
    </div>
  );
};

LoadingWeb3.propTypes = {
  onConnect: PropTypes.func.isRequired,
};

export default LoadingWeb3;
