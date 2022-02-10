import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { AutoPlayDialog } from './AutoPlayDialog';

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

describe('<AutoPlayDialog />', () => {
  it('renders properly with default values', () => {
    const wrapper = shallow(<AutoPlayDialog
      dialogOpen
      onCloseCallback={() => console.log('onCloseCallback')}
      onAutoDialogStart={() => console.log('onAutoDialogStart')}
      stakeIndex={0}
      onStakeChanged={() => console.log('onStakeChanged')}
    />);
    expect(wrapper).toMatchSnapshot();
  });
});
