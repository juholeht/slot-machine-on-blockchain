import {
  React, useEffect, useRef, useState,
} from 'react';
import {
  Container, Sprite, useApp, useTick,
} from '@inlet/react-pixi';

import PropTypes from 'prop-types';
import {
  REEL_COLUMN_INDEXES, REEL_WIDTH, REEL_ROW_INDEXES, SYMBOL_SIZE,
} from './constant';
import {
  createComponentKey, backout, lerp, calculateMargin,
} from './helpers';

const createReelsStateBasedOnScenario = (scenario) => {
  const initialReels = [];
  REEL_COLUMN_INDEXES.map((index) => {
    const reelState = {
      position: 0, previousPosition: 0, blur: { blurX: 0, blurY: 0 }, symbols: [],
    };
    REEL_ROW_INDEXES.map((i) => {
      const symbolState = {};
      symbolState.x = 0;
      symbolState.y = i * SYMBOL_SIZE;
      symbolState.scale = {
        x: 1,
        y: 1,
      };
      symbolState.texture = scenario[index][i];
      reelState.symbols[i] = symbolState;
      return symbolState;
    });
    initialReels[index] = reelState;
    return reelState;
  });
  return initialReels;
};

const createTween = (object, property, target, time, easing, onchange, oncomplete) => ({
  object,
  property,
  propertyBeginValue: object[property],
  target,
  easing,
  time,
  change: onchange,
  complete: oncomplete,
  start: Date.now(),
});

const REEL_ANIMATION_MULTIPLIER = 2;
const positionFineTuningBasedOnReel = (reelIndex) => 10 + (reelIndex * 5) + REEL_ANIMATION_MULTIPLIER;

const startPlay = (reels, setRunning, setInBetweenFrames) => {
  const stopRollingCallback = () => {
    setRunning(false);
  };

  let tweens = [];
  for (let i = 0; i < reels.length; i += 1) {
    const r = reels[i];
    const target = r.position + positionFineTuningBasedOnReel(i);
    const time = 2500 + i * 600 + REEL_ANIMATION_MULTIPLIER * 600;
    tweens = [
      ...tweens,
      {
        ...createTween(
          r,
          'position',
          target,
          time,
          backout(0.5),
          null,
          i === reels.length - 1 ? stopRollingCallback : null,
        ),
        i,
      },
    ];
  }

  setInBetweenFrames(tweens);
};

const ReelContainer = ({ running, setRunning, scenario }) => {
  const app = useApp();

  const reelContainerRef = useRef();
  const [reelsState, setReelsState] = useState([]);
  const [inBetweenFrames, setInBetweenFrames] = useState([]);

  useTick(() => {
    if (!running) return;
    const reelReferences = reelContainerRef.current.children;

    for (let i = 0; i < reelsState.length; i += 1) {
      const r = reelsState[i];
      r.blur.blurY = (r.position - r.previousPosition) * 8;
      r.previousPosition = r.position;
      // Update symbol positions on reel.
      for (let j = 0; j < r.symbols.length; j += 1) {
        const s = r.symbols[j];
        const prevy = s.y;
        s.y = ((r.position + j) % r.symbols.length) * SYMBOL_SIZE - SYMBOL_SIZE - positionFineTuningBasedOnReel(i);
        if (s.y < 0 && prevy > SYMBOL_SIZE) {
          s.texture = scenario[i][j];
          s.scale.x = Math.min(SYMBOL_SIZE / s.texture.width, SYMBOL_SIZE / s.texture.height);
          s.scale.y = Math.min(SYMBOL_SIZE / s.texture.width, SYMBOL_SIZE / s.texture.height);
          const symbolWidth = reelReferences[i].children[j].width;
          s.x = Math.round((SYMBOL_SIZE - symbolWidth) / 2);
        }
      }
    }
    setReelsState(reelsState);
  });

  useTick(() => {
    if (!running) return;

    const now = Date.now();
    const remove = [];
    const cloneFrames = Array.from(inBetweenFrames);
    for (let i = 0; i < cloneFrames.length; i += 1) {
      const t = cloneFrames[i];
      const phase = Math.min(1, (now - t.start) / t.time);
      reelsState[t.i][t.property] = lerp(t.propertyBeginValue, t.target, t.easing(phase));
      if (t.change) t.change(t);
      if (phase === 1) {
        reelsState[t.i][t.property] = t.target;
        if (t.complete) t.complete(t);
        remove.push(t);
      }
    }
    for (let i = 0; i < remove.length; i += 1) {
      cloneFrames.splice(cloneFrames.indexOf(remove[i]), 1);
    }
    setInBetweenFrames(cloneFrames);
    setReelsState(reelsState);
  });

  useEffect(() => {
    if (reelsState.length === 0) {
      setReelsState(createReelsStateBasedOnScenario(scenario));
    }
  }, [scenario]);

  useEffect(() => {
    if (running) {
      setReelsState(createReelsStateBasedOnScenario(scenario));
      const reelsWithResetPositions = reelsState.reduce((resetReels, reel) => ([
        ...resetReels, {
          ...reel,
          position: 0,
          previousPosition: 0,
          symbols: reel.symbols.reduce((resetSymbols, symbol, index) => [
            ...resetSymbols,
            { ...symbol, y: index * SYMBOL_SIZE }], []),
        }]), []);
      startPlay(reelsWithResetPositions, setRunning, setInBetweenFrames);
    }
  }, [running]);

  return (
    <Container
      ref={reelContainerRef}
      key="reelContainer"
      position={[Math.round(app.screen.width - REEL_WIDTH * 5), calculateMargin(app.screen.height)]}
    >
      {reelsState.map((reel, reelIndex) => (
        <Container
          key={createComponentKey(reelIndex)}
          blur={reel.blur}
          position={[reelIndex * REEL_WIDTH, reel.position]}
        >
          {
                reel.symbols.map((symbol, symbolIndex) => (
                  <Sprite
                    key={createComponentKey(reelIndex, symbolIndex)}
                    x={symbol.x}
                    y={symbol.y}
                    scale={symbol.scale}
                    texture={symbol.texture}
                  />
                ))
          }
        </Container>
      ))}
    </Container>
  );
};

ReelContainer.propTypes = {
  running: PropTypes.bool.isRequired,
  setRunning: PropTypes.func.isRequired,
  scenario: PropTypes.arrayOf(PropTypes.array).isRequired,
};

export default ReelContainer;
