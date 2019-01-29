import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

// import i18n from '../../utils/i18n';

import getComponents from '../../get-components';

const {
  Loading,
} = getComponents();

require('./Button.css');

export default class Button extends PureComponent {
  static propTypes = {
    as: PropTypes.any,
    className: PropTypes.string,
    children: PropTypes.node,

    primary: PropTypes.bool,
    loading: PropTypes.bool,
    disabled: PropTypes.bool,

    onClick: PropTypes.func,
  };

  static defaultProps = {
    as: 'button',
  };

  render() {
    const {
      as,
      className,
      children,
      primary,
      loading,
      disabled,
      onClick,
      ...props
    } = this.props;

    const notNaturalButton = as !== 'button';

    return React.createElement(
      as,
      {
        type: 'button',
        disabled: loading || disabled,
        onClick: notNaturalButton && (loading || disabled) ? undefined : onClick,
        ...props,
        className: `Button ${className || ''} ${primary ? 'Button--primary' : ''} ${notNaturalButton ? 'Button--notNaturalButton' : ''}`,
      },
      loading
        ? (<Loading />)
        : children,
    );
  }
}
