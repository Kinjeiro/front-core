import React from 'react';
import propTypes from 'prop-types';

import UNI_ERROR_PROP_TYPE from '../../../../../../common/models/uni-error';

import i18n from '../../i18n';

// import getComponents from '../../get-components';
//
// const {
// } = getComponents();

require('./NeedRelogin.scss');

export default class NeedRelogin extends React.PureComponent {
  static propTypes = {
    uniError: UNI_ERROR_PROP_TYPE,
    onGoToLogin: propTypes.func,
  };

  render() {
    const {
      // location,
      uniError: {
        uniMessage,
      },
      onGoToLogin,
    } = this.props;

    return (
      <div className="NeedRelogin">
        <h3 className="NeedRelogin__title">
          { uniMessage || i18n('containers.AuthErrorContainer.sessionExpire') }
        </h3>

        <button
          className="NeedRelogin__action"
          onClick={ onGoToLogin }
        >
          { i18n('containers.AuthErrorContainer.actionGoToLogin') }
        </button>
      </div>
    );
  }
}
