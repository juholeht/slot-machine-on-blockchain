import { expect } from 'chai';
import {
  countDecimals, isContractAvailable, round, create2xWinScenario, WIN_ORDER,
  create4xWinScenario, createJackspotScenario, createNoWinScenario, stringArrayToIntArray,
} from './helpers';

describe('Helper functions', () => {
  describe('countDecimals', () => {
    it('decimals counted correctly', () => {
      expect(countDecimals(10)).equals(0);
      expect(countDecimals(1.1)).equals(1);
      expect(countDecimals(0.11)).equals(2);
      expect(countDecimals(1.134)).equals(3);
      expect(countDecimals(1.1234)).equals(4);
      expect(countDecimals(1.12345)).equals(5);
      expect(countDecimals(1.123456)).equals(6);
      expect(countDecimals(1.1234567)).equals(7);
    });

    it('decimals counted from string', () => {
      expect(countDecimals('10')).equals(0);
      expect(countDecimals('10.2')).equals(1);
    });

    it('Return 0 decimals when syntax is wrong', () => {
      expect(countDecimals('10,2')).equals(0);
    });
  });

  describe('isContractAvailable', () => {
    it('Web3 not available', () => {
      expect(isContractAvailable(undefined)).equals(false);
    });

    it('Web3 available but contract address is not found (e.g. wrong network)', () => {
      expect(isContractAvailable({ _address: null })).equals(false);
    });

    it('Web3 and contract address avaible', () => {
      expect(isContractAvailable({ _address: '0xCd59B891cAbB312B8050e53e2EAd7632AAC27a65' })).equals(true);
    });
  });

  describe('round', () => {
    it('given decimal rounded correctly', () => {
      const testNum = 1.3210123456789;
      expect(round(testNum)).equals(1.3);
      expect(round(testNum, 1)).equals(1);
      expect(round(testNum, 10)).equals(1.3);
      expect(round(testNum, 100)).equals(1.32);
      expect(round(testNum, 1000)).equals(1.321);
      expect(round(testNum, 10000)).equals(1.3210);
    });

    it('given integer rounded correctly', () => {
      expect(round(10)).equals(10);
    });
  });

  describe('Winning scenarios', () => {
    const isSameTexture = (scenario, rowIndex) => scenario[rowIndex][WIN_ORDER[rowIndex]]
      .baseTexture.cacheId === scenario[0][WIN_ORDER[0]].baseTexture.cacheId;

    const isSameTextureInTheMiddle = (scenario) => scenario
      .every((_value, rowIndex) => isSameTexture(scenario, rowIndex));

    it('2x WIN', () => {
      const winningScenario = create2xWinScenario();
      expect(isSameTextureInTheMiddle(winningScenario)).equals(true);
    });

    it('4x WIN', () => {
      const winningScenario = create4xWinScenario();
      expect(isSameTextureInTheMiddle(winningScenario)).equals(true);
    });

    it('Jackpot WIN (or at this point only 8x)', () => {
      const winningScenario = createJackspotScenario();
      expect(isSameTextureInTheMiddle(winningScenario)).equals(true);
    });

    it('No WIN', () => {
      const winningScenario = createNoWinScenario();
      expect(isSameTextureInTheMiddle(winningScenario)).equals(false);
    });
  });

  describe('Convert array of strings to array of integers', () => {
    it('Array contains multiple strings', () => {
      const intArray = stringArrayToIntArray(['22', '33', '44']);
      expect(intArray.length).equals(3);
      expect(intArray[0]).equals(22);
      expect(intArray[1]).equals(33);
      expect(intArray[2]).equals(44);
    });

    it('Array is empty', () => {
      expect(stringArrayToIntArray([]).length).equals(0);
    });

    it('Array contains non-integer', () => {
      const intArray = stringArrayToIntArray(['foo', '2']);
      expect(intArray.length).equals(2);
      expect(Number.isNaN(intArray[0])).equals(true);
      expect(intArray[1]).equals(2);
    });
  });
});
