import {
  React, useEffect,
} from 'react';

import Typed from 'typed.js';

const NOT_WEB3_COMPATIBLE = 'Oops... looks like your browser is not compatible with Web3.';
const TRY_TO_CONNECT = 'Try to install and connect Web3 plugin first.';

const NoWeb3Support = () => {
  useEffect(() => {
    const typed = new Typed('#typed', {
      stringsElement: '#web3-instructions',
      typeSpeed: 30,
      loop: false,
    });
    typed.start();
  }, []);

  return (
    <div className="instruction-content">
      <div id="web3-instructions" className="instructions">
        <p>
          {NOT_WEB3_COMPATIBLE}
        </p>
        <p>
          {TRY_TO_CONNECT}
        </p>
      </div>
      <span id="typed" className="instructions" />
    </div>
  );
};

export default NoWeb3Support;
