import {
  React, useEffect, useState, useRef,
} from 'react';

import PropTypes from 'prop-types';
import Firework from './Firework';

const FIREWORK_COUNT = [...Array(15).keys()];

const createKeyForFirework = (i) => (`firework-${i}`);

const Fireworks = ({ fireworkDelay = 200 }) => {
  const willMount = useRef(true);

  const [fireworks, setFireworks] = useState([]);

  useEffect(() => {
  }, []);

  // ComponentWillMount ála hooks
  if (willMount.current) {
    FIREWORK_COUNT.map((_entry, i) => setTimeout(() => setFireworks((previousFireworks) => [
      ...previousFireworks, <Firework key={createKeyForFirework(i)} />], fireworkDelay * i)));
    willMount.current = false;
  }
  return fireworks;
};

Fireworks.propTypes = {
  fireworkDelay: PropTypes.number,
};

export default Fireworks;
