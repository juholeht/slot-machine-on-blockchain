import React, { useState, useEffect } from 'react';
import { Stage } from '@inlet/react-pixi';
import { IntlProvider } from 'react-intl';

import Web3 from 'web3';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import LoadingWeb3 from './instructions/LoadingWeb3';
import ContractNotFound from './instructions/ContractNotFound';

import CPanel from './slot/control/ControlPanel';

import OwlsJackpotContract from './contracts/OwlsJackpot.json';
import SBar from './slot/status/StatusBar';
import TxStepper from './transaction-stepper/TransactionStepper';
import WinningCard from './slot/winning/WinningCard';

import {
  consoleLogContractEvents, isContractAvailable, round, stringArrayToIntArray,
} from './slot/helpers';
import {
  ROUND_RESULT, RANDOMNESS_REQUESTED, NO_ONGOING_TRANSACTION, TRANSACTION_SUCCESSFUL,
  TRANSACTION_WAITING_CONFIRMATIONS,
  TRANSACTION_INITIATED, WITHDRAW_WINNINGS, STAKE_SIZE_OPTIONS, WINNINGS_SHOWN_DELAY,
} from './slot/constant';

import Slot from './slot/Slot';

import './App.css';

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: '58a71bb769eb47edb7fd1d2bd8351101', // required
    },
  },
};

const web3Modal = new Web3Modal({
  network: 'kovan', // optional
  cacheProvider: false, // optional
  providerOptions, // required
  displayNoInjectedProvider: false, // optional
  theme: 'dark',
});

const INITIAL_STATE = {
  winnigs: '0',
  jackpotPrize: '0',
  web3: null,
  accounts: [],
  contract: null,
  result: 0,
  unReveiledResults: [],
  winningIncrements: [],
  autoplay: false,
  running: false,
  balance: 0,
  startRoundConfirmationNumber: 0,
  transactionState: NO_ONGOING_TRANSACTION,
  showWinning: false,
  stakeSizeIndex: 0,
  initialSpinCount: 0,
};

const App = () => {
  const [appState, setAppState] = useState(INITIAL_STATE);

  const {
    web3, accounts, contract, autoplay, running, balance, winnings, jackpotPrize, result, startRoundConfirmationNumber,
    transactionState, unReveiledResults, showWinning, stakeSizeIndex, initialSpinCount, winningIncrements,
  } = appState;

  const initializeApp = async ({ loadedAccounts, loadedContract, web3Instance }) => {
    if (isContractAvailable(loadedContract)) {
      consoleLogContractEvents(loadedContract);
      // Get the value from the contract to prove it worked.
      const userWinnings = await loadedContract.methods.getWinningsForUser(loadedAccounts[0]).call();
      const currentJackpotPrize = await loadedContract.methods.getJackpotPrize().call();
      // Update state with the result.
      setAppState((prevState) => ({
        ...prevState,
        winnings: web3Instance.utils.fromWei(userWinnings),
        jackpotPrize: currentJackpotPrize,
      }));
    }
  };

  const resetApp = async (web3Instance) => {
    if (web3Instance && web3Instance.currentProvider && web3Instance.currentProvider.close) {
      await web3Instance.currentProvider.close();
    }
    await web3Modal.clearCachedProvider();
    setAppState(INITIAL_STATE);
  };

  const getUpdatedAccounts = async (web3Instance) => {
    const currentAccounts = await web3Instance.eth.getAccounts();
    const currentBalance = await web3Instance.eth.getBalance(currentAccounts[0]);
    return {
      balance: web3Instance.utils.fromWei(currentBalance),
      accounts: currentAccounts,
    };
  };

  const getUpdatedContractSpecificState = async (web3Instance) => {
    const updatedAccounts = await getUpdatedAccounts(web3Instance);
    const networkId = await web3Instance.eth.net.getId();
    const deployedNetwork = OwlsJackpotContract.networks[networkId];

    const instance = new web3Instance.eth.Contract(
      OwlsJackpotContract.abi,
      deployedNetwork && deployedNetwork.address,
    );

    const userWinnings = isContractAvailable(instance)
      ? await instance.methods.getWinningsForUser(updatedAccounts.accounts[0]).call() : '0';
    return {
      contract: instance,
      ...updatedAccounts,
      winnings: web3Instance.utils.fromWei(userWinnings),
    };
  };

  const subscribeProvider = async (web3Instance, provider) => {
    if (!provider.on) {
      return;
    }
    provider.on('close', () => resetApp(web3Instance));
    provider.on('accountsChanged', async (updatedAccounts) => {
      // eslint-disable-next-line no-console
      console.log('accountsChanged: ', updatedAccounts);
      if (!updatedAccounts || updatedAccounts.length === 0) {
        resetApp(web3Instance);
        return;
      }

      const updatedContractState = await getUpdatedContractSpecificState(web3Instance);
      setAppState((prevState) => ({
        ...prevState,
        ...updatedContractState,
      }));
    });
    provider.on('chainChanged', async (chainId) => {
      // eslint-disable-next-line no-console
      console.log('chainChanged: ', chainId);
      const updatedContractState = await getUpdatedContractSpecificState(web3Instance);
      setAppState((prevState) => ({
        ...prevState,
        ...updatedContractState,
      }));
    });

    provider.on('networkChanged', async (networkId) => {
      const chainId = await web3Instance.eth.getChainId();
      // eslint-disable-next-line no-console
      console.log('networkChanged: ', chainId, networkId);
      const updatedContractState = await getUpdatedContractSpecificState(web3Instance);
      setAppState((prevState) => ({
        ...prevState,
        ...updatedContractState,
      }));
    });
    provider.on('disconnect', async (event) => {
      // eslint-disable-next-line no-console
      console.log('Provider sent "disconnect" event: ', event);
    });
    provider.on('error', async (event) => {
      // eslint-disable-next-line no-console
      console.log('Provider sent "error" event: ', event);
    });
    provider.on('message', async (event) => {
      // eslint-disable-next-line no-console
      console.log('Provider sent "message" event: ', event);
    });
  };

  const onWeb3Connected = async () => {
    try {
      const provider = await web3Modal.connect();
      const web3Instance = new Web3(provider);

      subscribeProvider(web3Instance, provider);

      const updatedContractState = await getUpdatedContractSpecificState(web3Instance);

      setAppState((prevState) => ({
        ...prevState,
        web3: { ...web3Instance },
        ...updatedContractState,
      }));

      initializeApp({
        loadedAccounts: updatedContractState.accounts,
        loadedContract: updatedContractState.contract,
        web3Instance,
      });
    } catch (error) {
      // Catch any errors for any of the above operations.
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  // for now only one round (or multiple auto-play rounds) can be initiated at time.
  const startRoundConfirmationCallback = (confirmationNumber) => {
    setAppState((prevState) => ({
      ...prevState,
      startRoundConfirmationNumber: confirmationNumber,
      transactionState: prevState.transactionState === TRANSACTION_SUCCESSFUL ? prevState.transactionState
        : TRANSACTION_WAITING_CONFIRMATIONS,
    }));
  };

  const onPlayCallback = async (spinCount, transactionResultCallback = () => {}) => {
    const stakeSizeInWei = web3.utils.toWei(STAKE_SIZE_OPTIONS[stakeSizeIndex].toString(), 'ether');

    if (unReveiledResults.length === 0) {
      const startRoundPromise = contract.methods.startRound(spinCount)
        .send({ from: accounts[0], value: (stakeSizeInWei * spinCount) });

      startRoundPromise.on('confirmation', startRoundConfirmationCallback).then((tx) => {
        const { requestId } = tx.events[RANDOMNESS_REQUESTED].returnValues;
        contract.once(ROUND_RESULT, {
          filter: { requestId, fromBlock: tx.blockNumber },
          fromBlock: tx.blockNumber,
        }, (error, event) => {
          startRoundPromise.off('confirmation');
          const { returnValues } = event;
          // eslint-disable-next-line no-console
          console.log({ returnValues });
          const results = stringArrayToIntArray(returnValues.multipliers);
          const firstResultInQueue = results.shift();
          setAppState((prevState) => ({
            ...prevState,
            winningIncrements: stringArrayToIntArray(returnValues.winningIncrements),
            jackpotPrize: returnValues.jackpotPrize,
            result: firstResultInQueue,
            unReveiledResults: results,
            startRoundConfirmationNumber: -1,
            transactionState: TRANSACTION_SUCCESSFUL,
          }));
        });
        transactionResultCallback(true);
      })
        .catch(() => {
          setAppState((prevState) => ({
            ...prevState,
            transactionState: NO_ONGOING_TRANSACTION,
          }));
          transactionResultCallback(false);
        });
      setAppState((prevState) => ({
        ...prevState,
        transactionState: TRANSACTION_INITIATED,
        initialSpinCount: spinCount,
      }));
    }
  };

  const onWithdrawCallback = async () => {
    // TODO: make contract call async and update balance
    contract.methods.withdrawUserFunds().send({ from: accounts[0], value: 0 });
    contract.once(WITHDRAW_WINNINGS, {
      filter: { user: accounts[0] },
      fromBlock: 0,
    }, async (error, event) => {
      // eslint-disable-next-line no-console
      console.log('Withdraw event: ', event);
      const updatedContractState = await getUpdatedContractSpecificState(web3);
      setAppState((prevState) => ({
        ...prevState,
        ...updatedContractState,
      }));
    });
  };

  useEffect(() => {
    const getStateChangesToTriggerNewRound = () => {
      if (unReveiledResults.length > 0) {
        const resultsCopy = Array.from(unReveiledResults);
        // eslint-disable-next-line no-console
        console.log('Contains unreveiled results: ', resultsCopy);
        const firstResultInQueue = resultsCopy.shift();
        return {
          result: firstResultInQueue,
          unReveiledResults: resultsCopy,
          running: !running,
          winnings: web3.utils.fromWei(winningIncrements.shift().toString()),
        };
      }
      return winningIncrements.length > 0 ? {
        winnings: web3.utils.fromWei(winningIncrements.shift().toString()),
      } : {};
    };

    if (!running) {
      const stateChangesForNewRound = getStateChangesToTriggerNewRound();
      if (result !== 0) {
        setAppState((prevState) => ({
          ...prevState,
          showWinning: true,
        }));

        // how long there will be fireworks
        setTimeout(() => setAppState((prevState) => ({
          ...prevState,
          showWinning: false,
          ...stateChangesForNewRound,
        })), WINNINGS_SHOWN_DELAY);
      } else {
        setAppState((prevState) => ({
          ...prevState,
          ...stateChangesForNewRound,
        }));
      }
    }
  }, [running]);

  if (!web3) {
    return (
      <LoadingWeb3
        onConnect={onWeb3Connected}
      />
    );
  }

  if (!isContractAvailable(contract)) {
    return (<ContractNotFound />);
  }

  return (
    <IntlProvider defaultLocale="en" locale="en">
      <div className="App">
        <div
          className={transactionState !== NO_ONGOING_TRANSACTION ? 'dim' : 'no-dim'}
          disabled={transactionState !== NO_ONGOING_TRANSACTION}
        >
          <SBar
            address={accounts[0]}
            balance={round(balance, 10000000)}
            winnings={winnings}
            jackpotPrize={jackpotPrize}
          />
          <div className="slot-frame">
            <div className="sizer" id="example">
              <Stage options={{ backgroundColor: 0x282c34 }}>
                <Slot
                  result={result}
                  running={running}
                  setRunning={(value) => setAppState((prevState) => ({ ...prevState, running: value }))}
                  autoplay={autoplay}
                  showWinning={showWinning}
                />
              </Stage>
              <CPanel
                running={running}
                onPlayCallback={onPlayCallback}
                onAutoplayCallback={() => setAppState((prevState) => ({ ...prevState, autoplay: !autoplay }))}
                onWithdrawCallback={onWithdrawCallback}
                stakeIndex={stakeSizeIndex}
                onStakeChanged={(stake) => setAppState((prevState) => ({
                  ...prevState,
                  stakeSizeIndex: stake,
                }))}
              />
            </div>
          </div>
        </div>
        {(transactionState !== NO_ONGOING_TRANSACTION) && (
        <TxStepper
          transactionState={transactionState}
          confirmationNumber={startRoundConfirmationNumber}
          initialSpinCount={initialSpinCount}
          onClose={() => setAppState((prevState) => ({
            ...prevState,
            transactionState: NO_ONGOING_TRANSACTION,
            running: !running,
          }))}
        />
        )}
        {showWinning && <WinningCard winning={result * STAKE_SIZE_OPTIONS[stakeSizeIndex]} />}
      </div>
    </IntlProvider>
  );
};

export default App;
