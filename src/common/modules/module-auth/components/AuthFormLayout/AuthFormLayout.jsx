import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

// import i18n from '../../utils/i18n';

import './AuthFormLayout.css';

export default class AuthFormLayout extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    inModal: PropTypes.bool,
  };

  render() {
    const {
      className,
      children,
      inModal,
    } = this.props;

    return (
      <div className={ `AuthFormLayout ${className || ''} ${inModal ? 'AuthFormLayout--modal' : ''}` }>
        { children }
      </div>
    );
  }
}
