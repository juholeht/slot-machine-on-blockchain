import {
  React, useCallback, useEffect, useRef,
} from 'react';
import { Graphics, useApp } from '@inlet/react-pixi';
import { calculateMargin } from './helpers';

const ReelTop = () => {
  const app = useApp();
  const graphicsRef = useRef();
  const margin = calculateMargin(app.screen.height);

  const drawCb = useCallback((g) => {
    g.beginFill(0, 1);
    g.drawRect(0, 0, app.screen.width, margin);
  }, []);

  useEffect(() => {
  }, []);

  return (
    <Graphics draw={drawCb} ref={graphicsRef} />
  );
};

export default ReelTop;
