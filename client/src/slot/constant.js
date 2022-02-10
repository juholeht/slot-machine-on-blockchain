import { Texture } from 'pixi.js';

export const REEL_COLUMN_INDEXES = [...Array(5).keys()];
export const REEL_ROW_INDEXES = [...Array(4).keys()];
export const REEL_WIDTH = 160;
export const SYMBOL_SIZE = 150;

export const SLOT_TEXTURES = [
  Texture.from('pollo-1.png'),
  Texture.from('pollo-2.png'),
  Texture.from('pollo-3.png'),
  Texture.from('pollo-4.png'),
];

export const STAKE_SIZE_OPTIONS = [0.0001, 0.001, 0.01, 0.1, 1];
export const PREDEFINED_ROUND_COUNTS = [10, 20, 50, 100];

// 4secs
export const WINNINGS_SHOWN_DELAY = 4000;
export const FIREWORK_COUNT = [...Array(15).keys()];

export const ETH_CURRENCY_CHAR = 'Ξ';

// smart contract events
export const RANDOMNESS_FULFILLED = 'LogRandomnessFulfilled';
export const RANDOMNESS_REQUESTED = 'LogRequestedRandomness';
export const ROUND_RESULT = 'LogRoundResult';
export const WITHDRAW_WINNINGS = 'LogUserWithdrawWinnings';

export const NO_ONGOING_TRANSACTION = 'NO_ONGOING_TRANSACTION';
export const TRANSACTION_INITIATED = 'INITIATED';
export const TRANSACTION_WAITING_CONFIRMATIONS = 'WAITING_CONFIRMATIONS';
export const TRANSACTION_SUCCESSFUL = 'TRANSACTION_SUCCESSFUL';
