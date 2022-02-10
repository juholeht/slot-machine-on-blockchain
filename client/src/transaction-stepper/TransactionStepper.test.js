import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { TransactionStepper } from './TransactionStepper';
import { TRANSACTION_WAITING_CONFIRMATIONS } from '../slot/constant';

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

describe('<TransacitonStepper />', () => {
  it('renders properly with default values', () => {
    const wrapper = shallow(<TransactionStepper
      transactionState={TRANSACTION_WAITING_CONFIRMATIONS}
      confirmationNumber={0}
      onClose={() => {}}
      initialSpinCount={5}
    />);
    expect(wrapper).toMatchSnapshot();
  });
});
