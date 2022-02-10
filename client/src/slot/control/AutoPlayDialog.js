import { React, useState } from 'react';
import { defineMessage, useIntl, injectIntl } from 'react-intl';

import PropTypes from 'prop-types';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';

import { STAKE_SIZE_OPTIONS, ETH_CURRENCY_CHAR, PREDEFINED_ROUND_COUNTS } from '../constant';

const INITIAL_ROUNDS = 10;

const AUTO_DIALOG_MESSAGES = {
  stakeLabel: defineMessage({
    id: 'stakeLabel',
    description: 'Label for choosing the stake',
    defaultMessage: 'Stake',
  }),
  setAutoPlayTitle: defineMessage({
    id: 'setAutoPlayTitle',
    description: 'Title for setting the autoplay',
    defaultMessage: 'Set autoplay',
  }),
  totalRoundsLabel: defineMessage({
    id: 'totalRoundsLabel',
    description: 'Label for total rounds selected',
    defaultMessage: 'Total rounds',
  }),
  startButton: defineMessage({
    id: 'startButton',
    description: 'Text for start button',
    defaultMessage: 'Start',
  }),
};

export const AutoPlayDialog = ({
  dialogOpen, onCloseCallback, onAutoDialogStart, stakeIndex, onStakeChanged,
}) => {
  const [rounds, setRounds] = useState(INITIAL_ROUNDS);
  const intl = useIntl();

  const onStart = () => {
    onAutoDialogStart(rounds);
    setRounds(INITIAL_ROUNDS);
    onCloseCallback();
  };

  return (
    <Dialog onClose={onCloseCallback} aria-labelledby="simple-dialog-title" open={dialogOpen}>
      <DialogTitle id="simple-dialog-title">{intl.formatMessage(AUTO_DIALOG_MESSAGES.setAutoPlayTitle)}</DialogTitle>
      <FormControl fullWidth>
        <InputLabel id="stake-select-label">{intl.formatMessage(AUTO_DIALOG_MESSAGES.stakeLabel)}</InputLabel>
        <Select
          key={stakeIndex}
          labelId="stake-select-label"
          id="stake-select"
          value={stakeIndex}
          label={intl.formatMessage(AUTO_DIALOG_MESSAGES.stakeLabel)}
          onChange={({ target }) => onStakeChanged(target.value)}
        >
          {STAKE_SIZE_OPTIONS.reduce((stakeItemArray, item, index) => [...stakeItemArray,
            <MenuItem key={item} value={index}>
              {`${item} ${ETH_CURRENCY_CHAR}`}
            </MenuItem>], [])}
        </Select>
      </FormControl>
      <br />
      <FormControl fullWidth>
        <InputLabel id="total-rounds-select-label">Total rounds</InputLabel>
        <Select
          id="total-rounds-select"
          value={rounds}
          label={intl.formatMessage(AUTO_DIALOG_MESSAGES.totalRoundsLabel)}
          onChange={({ target }) => setRounds(target.value)}
        >
          {PREDEFINED_ROUND_COUNTS.reduce((roundsArray, item) => [...roundsArray,
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>], [])}
        </Select>
      </FormControl>
      <Button variant="outlined" color="primary" onClick={() => onStart()}>
        {intl.formatMessage(AUTO_DIALOG_MESSAGES.startButton)}
      </Button>
    </Dialog>
  );
};

AutoPlayDialog.propTypes = {
  dialogOpen: PropTypes.bool.isRequired,
  onCloseCallback: PropTypes.func.isRequired,
  onAutoDialogStart: PropTypes.func.isRequired,
  stakeIndex: PropTypes.number.isRequired,
  onStakeChanged: PropTypes.func.isRequired,
};

export default injectIntl(AutoPlayDialog);
