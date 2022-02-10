import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Fireworks from './Fireworks';

configure({ adapter: new Adapter() });

describe('<Fireworks />', () => {
  it('renders properly with default values', () => {
    // FIXME: does not render fireworks which are initialized only after mount
    const wrapper = shallow(<Fireworks fireworkDelay={0} />);
    expect(wrapper).toMatchSnapshot();
  });
});
