import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { ControlPanel } from './ControlPanel';

configure({ adapter: new Adapter() });

jest.mock('react-intl', () => {
  const reactIntl = jest.requireActual('react-intl');
  const intl = reactIntl.createIntl({
    locale: 'en',
  });
  return {
    ...reactIntl,
    useIntl: () => intl,
  };
});

describe('<ControlPanel />', () => {
  it('renders properly with default values', () => {
    const wrapper = shallow(<ControlPanel
      running={false}
      onPlayCallback={() => console.log('onPlayCallback')}
      onWithdrawCallback={() => console.log('onWithdrawCallback')}
      stakeIndex={0}
      onStakeChanged={() => console.log('onStakeChanged')}
    />);
    expect(wrapper).toMatchSnapshot();
  });
});
