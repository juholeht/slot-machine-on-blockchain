import {
  React, useCallback,
} from 'react';
import { Graphics, useApp } from '@inlet/react-pixi';
import { calculateMargin } from './helpers';
import { SYMBOL_SIZE } from './constant';

const ReelBottom = () => {
  const app = useApp();
  const margin = calculateMargin(app.screen.height);

  const drawCb = useCallback((g) => {
    g.beginFill(0, 1);
    g.drawRect(0, SYMBOL_SIZE * 3 + margin, app.screen.width, margin);
  }, []);

  return (
    <Graphics
      draw={drawCb}
    />
  );
};

export default ReelBottom;
