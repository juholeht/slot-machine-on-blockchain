import {
  React, useState, useEffect,
} from 'react';
import { defineMessage, useIntl, injectIntl } from 'react-intl';

import PropTypes from 'prop-types';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Typography from '@mui/material/Typography';
import RefreshIcon from '@mui/icons-material/Refresh';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import LocalAtmRoundedIcon from '@mui/icons-material/LocalAtmRounded';
import Tooltip from '@mui/material/Tooltip';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';

import APDialog from './AutoPlayDialog';
import './ControlPanel.css';
import { STAKE_SIZE_OPTIONS, ETH_CURRENCY_CHAR } from '../constant';

const COMMON_STYLE_FOR_ICON = ({ fontSize = '4rem' }) => ({
  styleOverrides: {
    root: {
      fontSize,
      color: 'white',
    },
  },
});

const COMMON_STYLE_FOR_EFFECT = {
  styleOverrides: {
    root: {
      color: 'white',
    },
  },
};

const playButtonTheme = createTheme({
  components: {
    MuiSvgIcon: COMMON_STYLE_FOR_ICON({ fontSize: '4rem' }),
    MuiIconButton: COMMON_STYLE_FOR_EFFECT,
  },
});

const autoplayTheme = createTheme({
  components: {
    MuiSvgIcon: COMMON_STYLE_FOR_ICON({ fontSize: '3rem' }),
    MuiIconButton: COMMON_STYLE_FOR_EFFECT,
    MuiBadge: {
      styleOverrides: {
        badge: {
          top: '13px',
          right: '50px',
        },
      },
    },
  },
});

const stakeSizeTheme = createTheme({
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          fontSize: '1rem',
          color: 'white',
        },
      },
    },
    MuiSvgIcon: COMMON_STYLE_FOR_ICON({ fontSize: '2rem' }),
    MuiIconButton: COMMON_STYLE_FOR_EFFECT,
  },
});

const dialogTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const CONTROL_PANEL_MESSAGES = {
  withdrawTooltip: defineMessage({
    id: 'withdrawTooltip',
    description: 'Tooltip instructions for withdraw button',
    defaultMessage: 'Withdraw your personal winnings from smart contract to your Ethereum address',
  }),
  increaseStakeTooltip: defineMessage({
    id: 'increaseStakeTooltip',
    description: 'Tooltip instructions for increasing stake button',
    defaultMessage: 'Increase stake',
  }),
  decreaseStakeTooltip: defineMessage({
    id: 'decreaseStakeTooltip',
    description: 'Tooltip instructions for decreasing stake button',
    defaultMessage: 'Decrease stake',
  }),
  playTooltip: defineMessage({
    id: 'playTooltip',
    description: 'Tooltip instructions for play button',
    defaultMessage: 'Play',
  }),
  autoplayTooltip: defineMessage({
    id: 'autoplayTooltip',
    description: 'Tooltip instructions for autoplay button',
    defaultMessage: 'Autoplay',
  }),
};

export const ControlPanel = ({
  running, onPlayCallback, onWithdrawCallback, stakeIndex, onStakeChanged,
}) => {
  const [roundsLeft, setRoundsLeft] = useState(0);
  const [roundsStarted, setRoundsStarted] = useState(false);
  const [autoPlayDialogOpen, setAutoPlayDialogOpen] = useState(false);
  const intl = useIntl();

  const transactionResultCallback = (success) => {
    if (!success) {
      setRoundsLeft(0);
    }
  };

  const onAutoDialogStart = (rounds) => {
    setRoundsLeft(rounds);
    setRoundsStarted(false);
    onPlayCallback(rounds, transactionResultCallback);
  };

  const decreaseStake = () => onStakeChanged(stakeIndex === 0 ? stakeIndex : stakeIndex - 1);
  const increaseStake = () => onStakeChanged(stakeIndex === STAKE_SIZE_OPTIONS.length - 1
    ? stakeIndex : stakeIndex + 1);

  useEffect(() => {
    if (roundsLeft > 0) {
      if (!running) {
        setRoundsLeft(roundsLeft - 1);
      } else if (!roundsStarted) {
        // reduce round count when queue is started so that real
        // count of rounds is shown when user is confirming transaction
        setRoundsLeft(roundsLeft - 1);
        setRoundsStarted(true);
      }
    }
  }, [running]);

  return (
    <div className="control-panel">
      <div className="withdraw">
        <ThemeProvider theme={playButtonTheme}>
          <Tooltip
            title={intl.formatMessage(CONTROL_PANEL_MESSAGES.withdrawTooltip)}
            arrow
            placement="right"
          >
            <IconButton
              color="info"
              aria-label="withdraw"
              component="span"
              onClick={onWithdrawCallback}
            >
              <LocalAtmRoundedIcon />
            </IconButton>
          </Tooltip>
        </ThemeProvider>
      </div>
      <div className="stake">
        <ThemeProvider theme={stakeSizeTheme}>
          <Tooltip title={intl.formatMessage(CONTROL_PANEL_MESSAGES.decreaseStakeTooltip)} arrow placement="left">
            <IconButton
              color="info"
              aria-label="decrease"
              component="span"
              onClick={decreaseStake}
            >
              <ArrowLeftIcon />
            </IconButton>
          </Tooltip>
          <Typography className="stakeValue" variant="h1" component="h2">
            {STAKE_SIZE_OPTIONS[stakeIndex]}
            {` ${ETH_CURRENCY_CHAR}`}
          </Typography>
          <Tooltip title={intl.formatMessage(CONTROL_PANEL_MESSAGES.increaseStakeTooltip)} arrow placement="right">
            <IconButton
              color="info"
              aria-label="increase"
              component="span"
              onClick={increaseStake}
            >
              <ArrowRightIcon />
            </IconButton>
          </Tooltip>
        </ThemeProvider>
      </div>
      <div className="playButton">
        <ThemeProvider theme={playButtonTheme}>
          <Tooltip title={intl.formatMessage(CONTROL_PANEL_MESSAGES.playTooltip)} arrow placement="left">
            <IconButton
              color="info"
              aria-label="play"
              component="span"
              onClick={() => { if (!running) onPlayCallback(1); }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </ThemeProvider>
      </div>
      <div className="autoPlayButton">
        <ThemeProvider theme={autoplayTheme}>
          <Tooltip title={intl.formatMessage(CONTROL_PANEL_MESSAGES.autoplayTooltip)} arrow placement="left">
            <IconButton disabled={roundsLeft > 0} onClick={() => setAutoPlayDialogOpen(true)}>
              <Badge badgeContent={roundsLeft} color="secondary" max={100}>
                <AutorenewIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        </ThemeProvider>
      </div>
      <ThemeProvider theme={dialogTheme}>
        <APDialog
          dialogOpen={autoPlayDialogOpen}
          onCloseCallback={() => setAutoPlayDialogOpen(false)}
          onAutoDialogStart={onAutoDialogStart}
          stakeIndex={stakeIndex}
          onStakeChanged={onStakeChanged}
        />
      </ThemeProvider>
    </div>
  );
};

ControlPanel.propTypes = {
  running: PropTypes.bool.isRequired,
  onPlayCallback: PropTypes.func.isRequired,
  onWithdrawCallback: PropTypes.func.isRequired,
  onStakeChanged: PropTypes.func.isRequired,
  stakeIndex: PropTypes.number.isRequired,
};

export default injectIntl(ControlPanel);
