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
    if (clientConfig.common.features.preLoader.autoClose) {
      actionClosePreLoader();
    } else {
      this.bodyElement.style.overflow = 'visible';
    }
  }

  componentWillReceiveProps(newProps) {
    const { isPreloaderVisible } = newProps;
    const autoClose = clientConfig.common.features.preLoader.autoClose;
    const domId = clientConfig.common.features.preLoader.domId;
    const preLoaderAutoCloseDelay = typeof autoClose === 'number' ? autoClose : 0;
    if (!isPreloaderVisible) {
      setTimeout(() => {
        if (domId) {
          const node = document.querySelector(`#${domId}`);
          // при hot reload node может уже и не быть
          if (node) {
            node.remove();
          }
        }
        this.bodyElement.style.overflow = 'visible';
      }, preLoaderAutoCloseDelay);
    }
  }

  render() {
    return this.props.children;
  }
}

