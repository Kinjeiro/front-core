import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import bind from 'lodash-decorators/bind';

import i18n from '../../utils/i18n-utils';
import {
  includes,
  wrapToArray,
} from '../../utils/common';
import USER_PROP_TYPE from '../../models/model-user-info';
import { getUserInfo } from '../../app-redux/selectors';
import { actions } from '../../app-redux/reducers/app/last-uni-error';
import { notifyError } from '../../helpers/notifications';

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
    checkAuth: true,
  };

  divRef = null;

  // ======================================================
  // LIFECYCLE
  // ======================================================
  // componentWllMount() {
  // }
  componentDidMount() {
    // true - catch while down
    this.divRef.addEventListener('click', this.handleClick, true);
  }

  componentWillUnmount() {
    this.divRef.removeEventListener('click', this.handleClick);
  }

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
    } else if (isNotPermission) {
      notifyError(i18n(
        'containers.AuthCheckWrapper.notPermissions',
        {
          permissions: wrapToArray(permissions).join(', '),
        },
      ));
    }
  }


  // ======================================================
  // RENDERS
  // ======================================================


  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      children,
    } = this.props;

    return (
      <div
        className="AuthCheckWrapper"
        ref={ (element) => { this.divRef = element; } }
      >
        { children }
      </div>
    );
  }
}

