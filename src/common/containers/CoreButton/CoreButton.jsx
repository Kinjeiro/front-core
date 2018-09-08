import React, { Component } from 'react';
import PropTypes from 'prop-types';

import getComponents from '../../get-components';

const {
  BaseButton,

  AuthCheckWrapper, // module-auth
} = getComponents();

/*
* Обертка над react-router чтобы потом при перехода на 4 версию ничего не отвалилвалось
*/
export default class CoreButton extends Component {
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    checkAuth: PropTypes.bool,
    permissions: AuthCheckWrapper.propTypes.permissions,
  };

  render() {
    const {
      children,
      checkAuth,
      permissions,
      className,
      ...otherProps
    } = this.props;

    return (
      <AuthCheckWrapper
        checkAuth={ checkAuth }
        permissions={ permissions }
      >
        <BaseButton
          { ...otherProps }
          className={ `CoreButton ${className || ''}` }
        >
          { children }
        </BaseButton>
      </AuthCheckWrapper>
    );
  }
}
