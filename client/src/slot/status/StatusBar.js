import {
  React,
} from 'react';
import { defineMessage, useIntl, injectIntl } from 'react-intl';

import PropTypes from 'prop-types';
import { ETH_CURRENCY_CHAR } from '../constant';

import './StatusBar.css';

const STATUS_BAR_MESSAGES = {
  addressText: defineMessage({
    id: 'addressText',
    description: 'Text for player address',
    defaultMessage: 'Address',
  }),
  balanceText: defineMessage({
    id: 'balanceText',
    description: 'Text for player balance',
    defaultMessage: 'Balance',
  }),
  winningsText: defineMessage({
    id: 'winningsText',
    description: 'Text for player winnings',
    defaultMessage: 'Winnings',
  }),
  jackpotText: defineMessage({
    id: 'jackpotText',
    description: 'Text for Jackpot prize pool',
    defaultMessage: 'Jackpot',
  }),
};

export const StatusBar = ({
  address, balance, winnings, jackpotPrize,
}) => {
  const intl = useIntl();

  return (
    <div className="account">
      <div className="address">
        {`${intl.formatMessage(STATUS_BAR_MESSAGES.addressText)}: ${address}`}
      </div>
      <div className="balances-row">
        <div className="balance">
          {`${intl.formatMessage(STATUS_BAR_MESSAGES.balanceText)}: ${balance} ${ETH_CURRENCY_CHAR}`}
        </div>
        <div className="winnings">
          {`${intl.formatMessage(STATUS_BAR_MESSAGES.winningsText)}: ${winnings} ${ETH_CURRENCY_CHAR}`}
        </div>
        <div className="jackpot">
          {`${intl.formatMessage(STATUS_BAR_MESSAGES.jackpotText)}: ${jackpotPrize} ${ETH_CURRENCY_CHAR}`}
        </div>
      </div>
    </div>
  );
};

StatusBar.propTypes = {
  address: PropTypes.string.isRequired,
  balance: PropTypes.number.isRequired,
  winnings: PropTypes.string.isRequired,
  jackpotPrize: PropTypes.string.isRequired,
};

export default injectIntl(StatusBar);
