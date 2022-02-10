import * as PIXI from 'pixi.js';

import {
  Container, withFilters,
} from '@inlet/react-pixi';
import {
  SYMBOL_SIZE, REEL_COLUMN_INDEXES, REEL_ROW_INDEXES, SLOT_TEXTURES,
} from './constant';

export const calculateMargin = (appScreenHeight) => (appScreenHeight - SYMBOL_SIZE * 3) / 2;
export const createComponentKey = (index, index2 = 0) => (`${index}_${index2}`);

export const lerp = (a1, a2, t) => (a1 * (1 - t) + a2 * t);
export const backout = (amount) => (t) => {
  const deInc = t - 1;
  return (deInc * deInc * ((amount + 1) * deInc + amount) + 1);
};

// Since reels rotates different time and speeds, middle row is not really in the middle when slot round is finished.
// Therefor, we need set textures so that symbols finishes to the middle:
// reel 0: symbol 2
// reel 1: symbol 1
// reel 2: symbol 0
// reel 3: symbol 3
// reel 4: symbol 2
export const WIN_ORDER = [2, 1, 0, 3, 2];

export const createWinScenarion = (middleRowSymbolIndex = 2) => REEL_COLUMN_INDEXES.reduce((reels, rIndex) => [
  ...reels, REEL_ROW_INDEXES.reduce((symbols, _, sIndex) => ([...symbols, sIndex === WIN_ORDER[rIndex]
    ? SLOT_TEXTURES[middleRowSymbolIndex] : SLOT_TEXTURES[Math.floor(Math.random() * SLOT_TEXTURES.length)]]),
  [])],
[]);

export const createJackspotScenario = () => createWinScenarion(2);
export const create2xWinScenario = () => createWinScenarion(1);
export const create4xWinScenario = () => createWinScenarion(0);

export const createNoWinScenario = () => {
  const middleRow = [];
  const randomScenario = REEL_COLUMN_INDEXES.reduce((reels, rIndex) => [
    ...reels, REEL_ROW_INDEXES.reduce((symbols, sIndex) => {
      const randomTextureIndex = Math.floor(Math.random() * SLOT_TEXTURES.length);
      if (WIN_ORDER[rIndex] === sIndex) {
        middleRow.push(randomTextureIndex);
      }
      return ([
        ...symbols, SLOT_TEXTURES[randomTextureIndex]]);
    },
    [])],
  []);
  // if all the middle row values are same, re-trigger new round.
  // odds even for one occurance are quite small
  if (middleRow.every((value, _rowIndex, array) => value === array[0])) {
    return createNoWinScenario();
  }
  return randomScenario;
};

export const Filters = withFilters(Container, {
  blur: PIXI.filters.BlurFilter,
});

export const round = (num, precision = 10) => Math.round((parseFloat(num) + Number.EPSILON) * precision) / precision;

export const parseEventsFromTx = (tx, eventName, paramValue) => {
  const txHash = tx.transactionHash;
  const filteredEvents = tx.events.filter((e) => (eventName === e.event && txHash === e.transactionHash));
  const filteredListOfReturnValues = filteredEvents.map((e) => e.returnValues[paramValue]);
  // eslint-disable-next-line no-console
  console.log(txHash, filteredEvents, filteredListOfReturnValues);
  return filteredListOfReturnValues;
};

export const consoleLogSymbolTextures = (reels) => {
  // eslint-disable-next-line no-console
  console.log('========= BEGIN ==========');
  // eslint-disable-next-line no-console
  reels.map((reel, ri) => reel.symbols.map((symbol, si) => console.log(
    `${ri}: ${si} => ${symbol.texture.textureCacheIds[0]}`,
  )));
  // eslint-disable-next-line no-console
  console.log('========= END ==========');
};

export const consoleLogSymbolsPosition = (reels) => {
  // eslint-disable-next-line no-console
  console.log('========= BEGIN ==========');
  // eslint-disable-next-line no-console
  reels.map((reel, ri) => reel.symbols.map((symbol, si) => console.log(
    `${ri}: ${si} => x: ${symbol.x}, y: ${symbol.y}, scale: ${JSON.stringify(symbol.scale)}`,
  )));
  // eslint-disable-next-line no-console
  console.log('========= END ==========');
};

export const consoleLogReelsPosition = (reels) => {
  // eslint-disable-next-line no-console
  console.log('========= BEGIN ==========');
  // eslint-disable-next-line no-console
  reels.map((reel, ri) => console.log(
    `${ri} => position: ${reel.position}`,
  ));
  // eslint-disable-next-line no-console
  console.log('========= END ==========');
};

export const consoleLogReelsBlur = (reels) => {
  // eslint-disable-next-line no-console
  console.log('========= BEGIN ==========');
  // eslint-disable-next-line no-console
  reels.map((reel, ri) => console.log(
    `${ri} => blur: ${JSON.stringify(reel.blur)}`,
  ));
  // eslint-disable-next-line no-console
  console.log('========= END ==========');
};

export const consoleLogContractEvents = (contract) => {
  contract.events.allEvents({
    // Using an array means OR: e.g. 20 or 23
    // myIndexedParam: [20, 23], myOtherIndexedParam: '0x123456789...'
    filter: { },
    fromBlock: 0,
  }, (error, event) => {
    // eslint-disable-next-line no-console
    console.log('Root event: ', event);
  })
    .on('connected', (subscriptionId) => {
      // eslint-disable-next-line no-console
      console.log('Connected event: ', subscriptionId);
    })
    .on('data', (event) => {
      // eslint-disable-next-line no-console
      console.log('Data event: ', event); // same results as the optional callback above
    })
    .on('changed', (event) => {
      // eslint-disable-next-line no-console
      console.log('Changed event: ', event); // remove event from local database
    })
    .on('error', (error, receipt) => {
      // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      // eslint-disable-next-line no-console
      console.log(receipt, error);
    });
};

export const isContractAvailable = (contract) => contract !== undefined
// eslint-disable-next-line no-underscore-dangle
&& contract !== null && contract._address !== null && contract !== undefined;

export const countDecimals = (number) => {
  if (Math.floor(number.valueOf()) === number.valueOf()) return 0;
  const str = number.toString();
  if (str.indexOf('.') !== -1 && str.indexOf('-') !== -1) {
    return str.split('-')[1] || 0;
  } if (str.indexOf('.') !== -1) {
    return str.split('.')[1].length || 0;
  }
  return str.split('-')[1] || 0;
};

export const stringArrayToIntArray = (resultStrings) => (resultStrings.reduce((intArray, r) => (
  [...intArray, parseInt(r, 10)]), []));
