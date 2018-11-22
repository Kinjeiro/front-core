import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import bind from 'lodash-decorators/bind';

// import i18n from '../../utils/i18n';

import getComponents from '../../get-components';

const {
} = getComponents();

// require('./AuthStubPage.scss');

export default class AuthStubPage extends PureComponent {
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
      <div className={ `AuthStubPage ${className || ''}` }>
        AuthStubPage
      </div>
    );
  }
}
