import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import bind from 'lodash-decorators/bind';

import {
  includes,
  wrapToArray,
} from '../../../../../../common/utils/common';
import USER_PROP_TYPE from '../../../../../../common/models/model-user-info';
import { actions } from '../../../../../../common/app-redux/reducers/app/last-uni-error';
import { notifyError } from '../../../../../../common/helpers/notifications';

// ======================================================
// MODULE
// ======================================================
import i18n from '../../i18n';

import { getUser } from '../../redux-selectors';

// import './AuthCheckWrapper.scss';

@connect(
  (globalState) => ({
    user: getUser(globalState),
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
    user: USER_PROP_TYPE,

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
  // UTILS
  // ======================================================
  isNotAuth() {
    const {
      user,
      checkAuth,
    } = this.props;

    return checkAuth && !user;
  }

  isNotPermission() {
    const {
      user,
      permissions,
    } = this.props;
    return permissions && permissions.length > 0 && (!user || !includes(user.permissions, permissions));
  }
  // ======================================================
  // HANDLERS
  // ======================================================
  @bind()
  handleClick(event) {
    const {
      permissions,
      linkForwardTo,
      actionThrowNotAuthError,
    } = this.props;

    const isNotAuth = this.isNotAuth();
    const isNotPermission = this.isNotPermission();

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
      checkAuth,
      permissions,
    } = this.props;

    if (!checkAuth && !permissions) {
      return children;
    }

    const isNotAuth = this.isNotAuth();
    const isNotPermission = this.isNotPermission();

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

