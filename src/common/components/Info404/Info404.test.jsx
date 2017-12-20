import React from 'react';
// @guide - к сожалению в новой версии нужно настраивать его, поэтому делаем это выше (\front-core\test\client\setup-client.js) и используем уже настроенную версию
// import { shallow, mount } from 'enzyme';

import Info404 from './Info404';

const { shallow, mount } = window.enzyme;

describe('<Info404/>', () => {
  it('should render without problems', () => {
    const wrapper = shallow(<Info404 />);
    expect(wrapper.exists()).to.equal(true);
    expect(wrapper.hasClass('Info404')).to.equal(true);
  });

  it('should render \'message\' property', () => {
    const message = 'TEST';
    const wrapper = mount(<Info404 message={ message } />);

    expect(wrapper.prop('message')).to.equal(message);
    expect(wrapper.find('b').text()).to.equal(message);
  });
});
