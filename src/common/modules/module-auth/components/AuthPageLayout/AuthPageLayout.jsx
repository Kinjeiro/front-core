import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

// import i18n from '../../utils/i18n';

import './AuthPageLayout.css';

import getComponents from '../../get-components';

const {
  AuthFormLayout,
} = getComponents();

export default class AuthPageLayout extends PureComponent {
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
      <div className={ `AuthPageLayout ${className || ''}` }>
        <div className="AuthPageLayout__body">
          <AuthFormLayout>
            { children }
          </AuthFormLayout>
        </div>
      </div>
    );
  }
}
