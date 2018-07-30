import React, { Component } from 'react';
import PropTypes from 'prop-types';

// import i18n from '../../utils/i18n';

import './AuthLayout.css';

export default class AuthLayout extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
  };

  render() {
    const {
      className,
      children,
    } = this.props;

    return (
      <div className={ `AuthLayout ${className || ''}` }>
        <div className="AuthLayout__body">
          { children }
        </div>
      </div>
    );
  }
}
