import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import bind from 'lodash-decorators/bind';

import authView from '../../../../../module-auth/common/subModule/decorators/auth-view-decorator';
import { TEST_PERMISSION } from '../../../../../module-auth/common/subModule/permissions';

// ======================================================
// MODULE
// ======================================================
// import i18n from '../../utils/i18n';
import MODULE_NAME from '../../module-name';
import { PATH_STUB_INDEX } from '../../routes-paths-stub';

import getComponents from '../../get-components';

const {
} = getComponents();

// require('./AuthStubPageWithDecorators.scss');

@authView({
  permissionsOr: [TEST_PERMISSION],
  redirectNotAccess: (getRoutePath) => getRoutePath(PATH_STUB_INDEX, MODULE_NAME),
})
export default class AuthStubPageWithDecorators extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
  };

  static defaultProps = {
  };

  // ======================================================
  // LIFECYCLE
  // ======================================================
  // componentWllMount() {
  // }
  // componentDidMount() {
  // }
  // componentWillReceiveProps(newProps) {
  // }


  // ======================================================
  // HANDLERS
  // ======================================================
  // @bind()

  // ======================================================
  // RENDERS
  // ======================================================


  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      className,
    } = this.props;

    return (
      <div className={ `AuthStubPageWithDecorators ${className || ''}` }>
        AuthStubPageWithDecorators with TEST_PERMISSION
      </div>
    );
  }
}

