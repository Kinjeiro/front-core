import React, { Component } from 'react';
import PropTypes from 'prop-types';

import getComponents from '../../get-components';

const {
  Button,

  AuthCheckWrapper, // module-auth
} = getComponents();

/*
* Обертка над react-router чтобы потом при перехода на 4 версию ничего не отвалилвалось
*/
export default class PermissionButton extends Component {
  static propTypes = {
    ...Button.propTypes,

    checkAuth: PropTypes.bool,
    permissions: AuthCheckWrapper.propTypes.permissions,
  };

  render() {
    const {
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
        <Button
          { ...otherProps }
          className={ `PermissionButton ${className || ''}` }
        />
      </AuthCheckWrapper>
    );
  }
}
