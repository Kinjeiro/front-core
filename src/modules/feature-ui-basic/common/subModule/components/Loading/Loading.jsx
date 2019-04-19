import React, { Component } from 'react';
import PropTypes from 'prop-types';

import bemDecorator from '../../../../../../common/utils/decorators/bem-component';

import i18n from '../../i18n';

// import './Loading.css';

@bemDecorator({ componentName: 'Loading', wrapper: false })
export default class Loading extends Component {
  static propTypes = {
    isLoading: PropTypes.bool,
    isLoaded: PropTypes.bool,

    loadingText: PropTypes.node,

    getChildren: PropTypes.func,
    getChildrenArgs: PropTypes.array,
    children: PropTypes.node,
  };

  static defaultProps = {
    isLoading: true,
    loadingText: i18n('components.Loading.loading'),
  };

  // ======================================================
  // LIFECYCLE
  // ======================================================
  // componentDidMount() {
  // }
  // componentWillReceiveProps(newProps) {
  // }


  // ======================================================
  // HANDLERS
  // ======================================================


  // ======================================================
  // RENDERS
  // ======================================================
  renderContent() {
    const {
      getChildren,
      getChildrenArgs = [],
      children = null,
    } = this.props;

    const content = getChildren
      ? getChildren.apply(this, getChildrenArgs)
      : children;

    return Array.isArray(content)
      ? (<div>{content}</div>)
      : content;
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      isLoading,
      isLoaded,
      loadingText,
    } = this.props;

    const finalIsLoaded = isLoaded || !isLoading;

    return finalIsLoaded
      ? this.renderContent()
      : (
        <div className={ this.fullClassName }>
          {loadingText}
        </div>
      );
  }
}
