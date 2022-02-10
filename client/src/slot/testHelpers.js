import React from 'react';
import { IntlProvider } from 'react-intl';
// eslint-disable-next-line import/no-extraneous-dependencies
import { mount, shallow } from 'enzyme';

const messages = require('../../lang/en.json');

export const mountWithIntl = (mountedComponent) => mount(
  <IntlProvider locale="en" messages={messages}>
    {mountedComponent}
  </IntlProvider>,
);

export const shallowWithIntl = (shallowedComponent) => shallow(
  <IntlProvider locale="en" messages={messages}>
    {shallowedComponent}
  </IntlProvider>,
);
