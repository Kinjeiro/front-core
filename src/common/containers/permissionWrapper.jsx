import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import i18n from '../utils/i18n-utils';

import clientConfig from '../client-config';

// ======================================================
// REDUX
// ======================================================
import * as reduxSelectors from '../app-redux/selectors';
import { actions as globalUniErrorActions } from '../app-redux/reducers/app/global-uni-error';

import USER_INFO_PROP_TYPE from '../models/user-info';
import { createUniError } from '../models/uni-error';
import { PATH_ACCESS_DENIED } from '../constants/routes.pathes';

export default function permissionWrapper(
  permissions,
  accessDeniedRoutePath = PATH_ACCESS_DENIED,
) {
  if (!Array.isArray(permissions)) {
    // eslint-disable-next-line no-param-reassign
    permissions = [permissions];
  }

  return (WrappedComponent) => {
    @connect(
      (state) => ({
        user: reduxSelectors.getUser(state),
      }),
      {
        actionChangeGlobalUniError: globalUniErrorActions.actionChangeGlobalUniError,
        actionGoTo: push,
      },
    )
    class PermissionCmpWrapper extends Component {
      static propTypes = {
        // from connect
        user: USER_INFO_PROP_TYPE,
        actionChangeGlobalUniError: PropTypes.func,
        actionGoTo: PropTypes.func,
      };

      componentWillMount() {
        const {
          user,
          actionChangeGlobalUniError,
          actionGoTo,
        } = this.props;

        const authTurnOn = clientConfig.common.features.auth
          && clientConfig.common.features.auth.permissions;

        if (authTurnOn) {
          const configPermissions = (Array.isArray(clientConfig.common.permissions) && clientConfig.common.permissions)
            || [];
          const allow =
            permissions.every((permission) =>
              (user && user.permissions.includes(permission))
              || configPermissions.includes(permission));

          if (!allow) {
            actionChangeGlobalUniError(createUniError(i18n('core:У вас нет прав на просмотр страницы')));
            actionGoTo(accessDeniedRoutePath);
          }
        }
      }

      // ======================================================
      // MAIN RENDER
      // ======================================================
      render() {
        return (
          <WrappedComponent { ...this.props } />
        );
      }
    }

    return PermissionCmpWrapper;
  };
}

