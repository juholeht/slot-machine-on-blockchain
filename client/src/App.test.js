import React from 'react';
import { expect } from 'chai';
import { shallow, configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import App from './App';
import LoadingWeb3 from './instructions/LoadingWeb3';

configure({ adapter: new Adapter() });

describe('<App />', () => {
  it('renders LoadingWeb3 component', () => {
    const wrapper = shallow(<App />);
    expect(wrapper.find(LoadingWeb3)).to.have.lengthOf(1);
  });
});
