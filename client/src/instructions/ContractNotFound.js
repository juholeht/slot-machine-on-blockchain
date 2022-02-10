import {
  React, useEffect,
} from 'react';

import Typed from 'typed.js';

const ContractNotFound = () => {
  useEffect(() => {
    const typed = new Typed('#typed', {
      stringsElement: '#web3-instructions',
      typeSpeed: 10,
      loop: false,
    });
    typed.start();
  }, []);

  return (
    <div className="instruction-content">
      <div id="web3-instructions" className="instructions">
        <p>
          {'Wrong network! Please switch your wallet network to '}
          <strong>Kovan</strong>
          {' to use the app.'}
        </p>
      </div>
      <span id="typed" className="instructions" />
    </div>
  );
};

export default ContractNotFound;
