import React, { useEffect } from 'react';
import { defineMessage, useIntl, injectIntl } from 'react-intl';

import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useCountUp } from 'react-countup';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import { ETH_CURRENCY_CHAR } from '../constant';
import { countDecimals } from '../helpers';

import './WinningCard.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const WINNING_CARD_MESSAGES = {
  winningInfo: defineMessage({
    id: 'winningInfoText',
    description: 'Text to inform that player won',
    defaultMessage: 'You WON!!',
  }),
};

const WinningCard = ({ winning }) => {
  const countUpRef = React.useRef(null);
  const {
    start, pauseResume,
  } = useCountUp({
    ref: countUpRef,
    start: 0,
    end: winning,
    delay: 500,
    duration: 2,
    decimals: countDecimals(winning) + 2,
    suffix: ` ${ETH_CURRENCY_CHAR}`,
  });

  const intl = useIntl();

  useEffect(() => {
    start();
    pauseResume();
  }, []);

  return (
    <div className="winning-card">
      <ThemeProvider theme={theme}>
        <Box sx={{ maxWidth: 300 }}>
          <Card sx={{ width: 300 }}>
            <CardContent>
              <div className="winning-text">
                {intl.formatMessage(WINNING_CARD_MESSAGES.winningInfo)}
                {' '}
                &#127881;
                <div className="winning-prize" ref={countUpRef} />
              </div>
            </CardContent>
          </Card>
        </Box>
      </ThemeProvider>
    </div>
  );
};

WinningCard.propTypes = {
  winning: PropTypes.number.isRequired,

};

export default injectIntl(WinningCard);
