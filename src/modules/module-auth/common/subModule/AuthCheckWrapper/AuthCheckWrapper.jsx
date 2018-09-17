import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import bind from 'lodash-decorators/bind';

import i18n from '../../../../../common/utils/i18n-utils';
import {
  includes,
  wrapToArray,
} from '../../../../../common/utils/common';
import USER_PROP_TYPE from '../../../../../common/models/model-user-info';
import { getUserInfo } from '../../../../../common/app-redux/selectors';
import { actions } from '../../../../../common/app-redux/reducers/app/last-uni-error';
import { notifyError } from '../../../../../common/helpers/notifications';

// import './AuthCheckWrapper.scss';

@connect(
  (globalState) => ({
    userInfo: getUserInfo(globalState),
  }),
  {
    ...actions,
  },
)
export default class AuthCheckWrapper extends Component {
  static propTypes = {
    children: PropTypes.node,
    checkAuth: PropTypes.bool,
    permissions: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    linkForwardTo: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
    ]),

    // ======================================================
    // @connect
    // ======================================================
    userInfo: USER_PROP_TYPE,

    actionThrowNotAuthError: PropTypes.func,
  };

  static defaultProps = {
    checkAuth: false,
    permissions: null,
  };

  // elementDom = null;

  // ======================================================
  // LIFECYCLE
  // ======================================================
  // componentWllMount() {
  // }
  // componentDidMount() {
  //   // ReactDom.findDOMNode(this)
  //   // true - catch while down
  //   this.elementDom.addEventListener('click', this.handleClick, true);
  // }
  //
  // componentWillUnmount() {
  //   this.elementDom.removeEventListener('click', this.handleClick);
  // }

  // ======================================================
  // HANDLERS
  // ======================================================
  @bind()
  handleClick(event) {
    const {
      userInfo,
      checkAuth,
      permissions,
      linkForwardTo,
      actionThrowNotAuthError,
    } = this.props;

    const isNotAuth = checkAuth && !userInfo.username;
    const isNotPermission = permissions && permissions.length > 0 && !includes(userInfo.permissions, permissions);

    if (isNotAuth || isNotPermission) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (isNotAuth) {
      actionThrowNotAuthError(linkForwardTo);
      return false;
    } else if (isNotPermission) {
      notifyError(i18n(
        'containers.AuthCheckWrapper.notPermissions',
        {
          permissions: wrapToArray(permissions).join(', '),
        },
      ));
      return false;
    }
    return true;
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      children,

      userInfo,
      checkAuth,
      permissions,
    } = this.props;

    if (!checkAuth && !permissions) {
      return children;
    }

    const isNotAuth = checkAuth && !userInfo.username;
    const isNotPermission = permissions && permissions.length > 0 && !includes(userInfo.permissions, permissions);

    return React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) {
        return child;
      }

      const {
        className,
        onClick,
      } = child.props;

      return React.cloneElement(children, {
        className: `AuthCheckWrapper ${isNotAuth ? 'AuthCheckWrapper--notAuth' : ''} ${isNotPermission ? 'AuthCheckWrapper--notPermission' : ''} ${className || ''}`,
        onClick: (event) => {
          if (this.handleClick(event) && onClick) {
            onClick(event);
          }
        },
      });
    });
  }
}

