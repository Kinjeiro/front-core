import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { actions } from '../common/app-redux/reducers/app/pre-loader';
import clientConfig from '../common/client-config';


// ======================================================
// CLIENT ROOT
// ======================================================
@connect((globalState) => ({
  isPreloaderVisible: globalState.preLoader.isPreloaderVisible,
}), {
  ...actions,
})
export default class RootWithStore extends Component {
  static propTypes = {
    children: PropTypes.element,
    actionClosePreLoader: PropTypes.func,
    isPreloaderVisible: PropTypes.bool,
  };

  bodyElement = document.querySelector('body');

  componentDidMount() {
    const { actionClosePreLoader } = this.props;
    const { preLoader: { autoClose = false } = {} } = clientConfig.common.features;
    if (autoClose) {
      actionClosePreLoader();
    } else {
      this.bodyElement.style.overflow = 'visible';
    }
  }

  componentWillReceiveProps(newProps) {
    const { isPreloaderVisible } = newProps;
    const { preLoader: { autoClose, domId } = {} } = clientConfig.common.features;
    const preLoaderAutoCloseDelay = typeof autoClose === 'number' ? autoClose : 0;
    if (!isPreloaderVisible) {
      setTimeout(() => {
        document.querySelector(`#${domId}`).remove();
        this.bodyElement.style.overflow = 'visible';
      }, preLoaderAutoCloseDelay);
    }
  }

  render() {
    return this.props.children;
  }
}

