import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import getComponents from '../../get-components';

import PROPS from './button-props';

const {
  Loading,
} = getComponents();

require('./ButtonView.css');

export default class ButtonView extends PureComponent {
  static propTypes = PROPS;

  static defaultProps = {
    as: 'button',
  };

  render() {
    const {
      as,
      loading,
      disabled,
      children,
      className,
      notNaturalButton,
      asyncIsLoading,

      onClick,
    } = this.props;

    const notNaturalButtonFinal = typeof notNaturalButton !== 'undefined' ? notNaturalButton : as !== ButtonView.defaultProps.as;

    return React.createElement(
      as,
      {
        ...(notNaturalButtonFinal ? {} : this.props),
        onClick: notNaturalButtonFinal && disabled ? undefined : onClick,
        className: `${className} ${notNaturalButtonFinal ? 'Button--notNaturalButton' : ''}`,
      },
      loading ? (<Loading />) : children,
    );
  }
}
