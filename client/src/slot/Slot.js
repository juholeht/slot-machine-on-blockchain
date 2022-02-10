import { React, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Fireworks from './fireworks/Fireworks';
import ReelBottom from './ReelBottom';
import ReelContainer from './ReelContainer';
import ReelTop from './ReelTop';
import {
  create2xWinScenario, create4xWinScenario, createJackspotScenario, createNoWinScenario,
} from './helpers';

const noWinScenario = createNoWinScenario();

const Slot = ({
  result, running, setRunning, showWinning,
}) => {
  const [scenario, setScenario] = useState(noWinScenario);

  useEffect(() => {
    if (running) {
      switch (result) {
        case 8:
          setScenario(createJackspotScenario());
          break;
        case 4:
          setScenario(create4xWinScenario());
          break;
        case 2:
          setScenario(create2xWinScenario());
          break;
        default:
          setScenario(createNoWinScenario());
          break;
      }
    }
  }, [running, result]);

  return (
    <>
      <ReelContainer
        running={running}
        setRunning={setRunning}
        scenario={scenario}
      />
      <ReelBottom />
      <ReelTop />
      { showWinning && <Fireworks /> }
    </>
  );
};

Slot.propTypes = {
  result: PropTypes.number.isRequired,
  running: PropTypes.bool.isRequired,
  setRunning: PropTypes.func.isRequired,
  showWinning: PropTypes.bool.isRequired,
};

export default Slot;
