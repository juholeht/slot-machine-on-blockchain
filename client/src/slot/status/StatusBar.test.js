import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { StatusBar } from './StatusBar';

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

describe('<StatusBar />', () => {
  it('renders properly with default values', () => {
    const wrapper = shallow(<StatusBar
      address="0xfoobar"
      balance={0.62}
      winnings={0.0044}
      jackpotPrize={12.4234}
    />);
    expect(wrapper).toMatchSnapshot();
  });
});
