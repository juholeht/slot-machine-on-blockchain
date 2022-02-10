import {
  React, useRef, useState, useEffect,
} from 'react';
import * as PIXI from 'pixi.js';
import { AnimatedSprite, useApp } from '@inlet/react-pixi';
import FireworksBaseTexture from './Firework.png';
import FireworksJson from './fireworks.json';

const IS_PLAYING = true;

const getRandomX = (app) => Math.random() * app.screen.width;
const getRandomY = (app) => Math.random() * app.screen.height;

const Firework = () => {
  const willMount = useRef(true);
  const app = useApp();
  const [textures, setTextures] = useState([]);
  const [x, setX] = useState(getRandomX(app));
  const [y, setY] = useState(getRandomY(app));

  const loadSpritesheet = () => {
    const baseTexture = PIXI.BaseTexture.from(FireworksBaseTexture);
    const spritesheet = new PIXI.Spritesheet(baseTexture, FireworksJson);
    spritesheet.parse(() => {
      setTextures(Object.keys(spritesheet.textures).map((t) => spritesheet.textures[t]));
    });
  };

  // ComponentWillMount ála hooks
  if (willMount.current) {
    loadSpritesheet();
    willMount.current = false;
  }

  const updatePositions = () => {
    setX(getRandomX(app));
    setY(getRandomY(app));
  };

  useEffect(() => {
    PIXI.utils.clearTextureCache();
  }, []);

  return (
    <AnimatedSprite
      x={x}
      y={y}
      anchor={0.5}
      scale={0.75 + Math.random() * 0.3}
      textures={textures}
      isPlaying={IS_PLAYING}
      initialFrame={0}
      animationSpeed={0.3}
      onLoop={updatePositions}
    />
  );
};

export default Firework;
