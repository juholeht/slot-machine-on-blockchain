import {
  React, useEffect, useState,
} from 'react';

import PropTypes from 'prop-types';

import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Switch from '@mui/material/Switch';

const DevelopmentSettings = ({ onResultCallback }) => {
  const [result, setResult] = useState(0);

  useEffect(() => {
    onResultCallback(result);
  }, [result]);

  return (
    <FormControl component="fieldset" variant="standard">
      <FormLabel component="legend" style={{ color: '#f0f0f0' }}>Development settigs: </FormLabel>
      <FormGroup>
        <FormControlLabel
          control={
            <Switch checked={result === 0} onChange={() => setResult(0)} name="nowin" />
}
          label="No WIN :("
          style={{ color: '#f0f0f0' }}
        />
        <FormControlLabel
          control={
            <Switch checked={result === 1} onChange={() => setResult(1)} name="jackpot" />
}
          label="JACKPOT! :D"
          style={{ color: '#f0f0f0' }}
        />
        <FormControlLabel
          control={
            <Switch checked={result === 2} onChange={() => setResult(2)} name="2x" />
}
          label="2x WIN :)"
          style={{ color: '#f0f0f0' }}
        />
        <FormControlLabel
          control={
            <Switch checked={result === 3} onChange={() => setResult(3)} name="4x" />
}
          label="4x WIN :))"
          style={{ color: '#f0f0f0' }}
        />
      </FormGroup>
      <FormHelperText style={{ color: '#f0f0f0' }}>
        This business logic will be in the smart contract later...
      </FormHelperText>
    </FormControl>
  );
};

DevelopmentSettings.propTypes = {
  onResultCallback: PropTypes.func.isRequired,
};

export default DevelopmentSettings;
