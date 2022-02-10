import { TextStyle } from 'pixi.js';

const ReelTextStyle = new TextStyle({
  align: 'center',
  fontFamily: '"Leckerli One", Helvetica, sans-serif',
  fontSize: 50,
  fontWeight: 400,
  fill: ['#ffffff', '#00ff99'], // gradient
  stroke: '#01d27e',
  strokeThickness: 5,
  letterSpacing: 20,
  dropShadow: true,
  dropShadowColor: '#ccced2',
  dropShadowBlur: 4,
  dropShadowAngle: Math.PI / 6,
  dropShadowDistance: 6,
  wordWrap: true,
  wordWrapWidth: 440,
});

export default ReelTextStyle;
