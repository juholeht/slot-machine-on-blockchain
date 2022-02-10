import React, { useEffect, useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import PropTypes from 'prop-types';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { defineMessage, useIntl, injectIntl } from 'react-intl';

import './TransactionStepper.css';
import { TRANSACTION_SUCCESSFUL, TRANSACTION_WAITING_CONFIRMATIONS } from '../slot/constant';

const TRANSACTION_STEPPER_MESSAGES = {
  gameRoundInitiationLabel: defineMessage({
    id: 'gameRoundInitiationLabel',
    description: 'Label for game round initiation',
    defaultMessage: 'Game round initiation',
  }),
  gameRoundInitiationDescription: defineMessage({
    id: 'gameRoundInitiationDescription',
    description: 'Description for game round initiation',
    defaultMessage: 'Confirm transaction first. After that, it will be recorded to blockchain.',
  }),
  waitingConfirmationsLabel: defineMessage({
    id: 'waitingConfirmationsLabel',
    description: 'Label for waiting confirmations',
    defaultMessage: 'Waiting for confirmation',
  }),
  waitingConfirmationsDescription: defineMessage({
    id: 'waitingConfirmationsDescription',
    description: 'Description for waiting confirmations',
    defaultMessage: 'Almost there! Waiting for transaction confirmations to'
    + ' guarantee that the result is provably fair.',
  }),
  totalRounds: defineMessage({
    id: 'totalRounds',
    description: 'Info about game round initiation',
    defaultMessage: 'Total game rounds of {initialSpinCount} selected.',
  }),
  gameIsReady: defineMessage({
    id: 'gameIsReady',
    description: 'Info about readiness of round',
    defaultMessage: 'Everything is now ready. Game on!',
  }),
  spinTheWheel: defineMessage({
    id: 'spinTheWheel',
    description: 'Text for button to start round',
    defaultMessage: 'Spin the wheel!',
  }),
};

const createInstructionsSteps = (intl) => ([
  {
    key: 'gameRoundInitiationLabel',
    label:
  <p>
    {intl.formatMessage(TRANSACTION_STEPPER_MESSAGES.gameRoundInitiationLabel)}
    {' '}
    &#9881;&#65039;
  </p>,
    description: intl.formatMessage(TRANSACTION_STEPPER_MESSAGES.gameRoundInitiationDescription),
  },
  {
    key: 'waitingConfirmationsLabel',
    label:
  <p>
    {intl.formatMessage(TRANSACTION_STEPPER_MESSAGES.waitingConfirmationsLabel)}
    {' '}
    &#128279;
  </p>,
    description:
    intl.formatMessage(TRANSACTION_STEPPER_MESSAGES.waitingConfirmationsDescription),
  },
]);

const stepperTheme = createTheme({
  palette: {
    mode: 'dark',
  },
  components: {
    MuiStepLabel: {
      styleOverrides: {
        label: {
          fontSize: '1.1rem',
          fontWeight: 700,
        },
      },
    },
  },
});

export const TransactionStepper = ({
  transactionState, confirmationNumber, onClose, initialSpinCount,
}) => {
  const willMount = useRef(true);
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [instructionSteps, setInstructionSteps] = useState([]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const intl = useIntl();

  // ComponentWillMount ála hooks
  if (willMount.current) {
    setInstructionSteps(createInstructionsSteps(intl));
    willMount.current = false;
  }

  useEffect(() => {
    if (transactionState === TRANSACTION_WAITING_CONFIRMATIONS || transactionState === TRANSACTION_SUCCESSFUL) {
      handleNext();
    }
  }, [transactionState]);

  useEffect(() => {
    if (confirmationNumber > 0) {
      // it needs approx. 10 confirmation in kovan network currently meaning that 10 * 10 would be 100% progress.
      const updatedProgress = confirmationNumber * 10;
      if (updatedProgress <= 100) setProgress(updatedProgress);
    } else {
      setProgress(0);
    }
  }, [confirmationNumber]);

  const resetComponentState = () => {
    setProgress(0);
    setActiveStep(0);
    onClose();
  };

  return (
    <div className="transaction-stepper">
      <ThemeProvider theme={stepperTheme}>
        <Box sx={{ maxWidth: 400 }}>
          <Card sx={{ width: 400 }}>
            <CardContent>
              <Stepper activeStep={activeStep} orientation="vertical">
                {instructionSteps.map((step, index) => (
                  <Step key={step.key}>
                    <StepLabel sx={{ textAlign: 'left', fontSize: '1rem' }}>
                      {step.label}
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2" sx={{ textAlign: 'left', fontSize: '0.8rem' }}>
                        {index === 0 && initialSpinCount > 1
                          ? `${step.description} 
                          ${intl.formatMessage(TRANSACTION_STEPPER_MESSAGES.totalRounds,
                            { initialSpinCount })} `
                          : step.description}
                      </Typography>
                      <Box sx={{ mb: 2, paddingTop: '2rem', paddingRight: '2rem' }}>
                        {index === instructionSteps.length - 1
                          ? (<LinearProgress variant="determinate" value={progress} />)
                          : <CircularProgress />}
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
              {activeStep === instructionSteps.length && (
                <Paper square elevation={0} sx={{ p: 3 }}>
                  <Typography variant="body2">
                    {intl.formatMessage(TRANSACTION_STEPPER_MESSAGES.gameIsReady)}
                    {' '}
                    &#129299; &#127920;
                  </Typography>
                  <Button onClick={resetComponentState} sx={{ mt: 1, mr: 1 }}>
                    { intl.formatMessage(TRANSACTION_STEPPER_MESSAGES.spinTheWheel) }
                  </Button>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Box>
      </ThemeProvider>
    </div>
  );
};

TransactionStepper.propTypes = {
  transactionState: PropTypes.string.isRequired,
  confirmationNumber: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  initialSpinCount: PropTypes.number.isRequired,
};

export default injectIntl(TransactionStepper);
