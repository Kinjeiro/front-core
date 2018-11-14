import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import {
  push,
  replace as replaceLocation,
} from 'react-router-redux';
import bind from 'lodash-decorators/bind';

import {
  getModuleFullPath,
} from '../../helpers/app-urls';
import {
  getModuleRoutePath,
} from '../../utils/uri-utils';

import { actions as modulesActions } from '../../app-redux/reducers/app/redux-modules';
// import i18n from '../../utils/i18n';

// import './ModuleRouteProvider.scss';

const ContextModules = React.createContext({
  getFullPath: null,
  getRoutePath: null,
  onGoTo: null,
  onReplaceLocation: null,
  location: null,
  moduleToRoutePrefixMap: {},
});

export const ContextModulesConsumer = ContextModules.Consumer;

@withRouter
@connect(
  (globalState) => ({
  }),
  {
    ...modulesActions,
    actionGoTo: push,
    actionReplaceLocation: replaceLocation,
  },
)
export default class ContextModulesProvider extends Component {
  static propTypes = {
    // ======================================================
    // PROPS
    // ======================================================
    children: PropTypes.node,
    moduleToRoutePrefixMap: PropTypes.object,

    // ======================================================
    // @withRouter
    // ======================================================
    match: PropTypes.object,
    location: PropTypes.object,
    history: PropTypes.object,

    // ======================================================
    // @connect
    // ======================================================
    actionInitModulesRoutePrefixes: PropTypes.func,
    actionGoTo: PropTypes.func,
    actionReplaceLocation: PropTypes.func,
  };

  static defaultProps = {
    moduleToRoutePrefixMap: {},
  };

  // ======================================================
  // LIFECYCLE
  // ======================================================
  componentWillMount() {
    const {
      moduleToRoutePrefixMap,
      actionInitModulesRoutePrefixes,
    } = this.props;

    actionInitModulesRoutePrefixes(moduleToRoutePrefixMap);
  }
  // componentDidMount() {
  // }
  // componentWillReceiveProps(newProps) {
  // }

  // ======================================================
  // UTILS
  // ======================================================
  @bind()
  getFullPath(relativeLocation, moduleName = null) {
    const {
      moduleToRoutePrefixMap,
    } = this.props;
    return getModuleFullPath(relativeLocation, moduleName, moduleToRoutePrefixMap);
  }
  @bind()
  getRoutePath(relativeLocation, moduleName = null) {
    const {
      moduleToRoutePrefixMap,
    } = this.props;
    return getModuleRoutePath(relativeLocation, moduleName, moduleToRoutePrefixMap);
  }

  @bind()
  onGoTo(relativeLocation, moduleName = null) {
    const {
      actionGoTo,
    } = this.props;
    // роутинг нужно делать без контекст паса
    return actionGoTo(this.getRoutePath(relativeLocation, moduleName));
  }
  @bind()
  onReplaceLocation(relativeLocation, moduleName = null) {
    const {
      actionReplaceLocation,
    } = this.props;
    // роутинг нужно делать без контекст паса
    return actionReplaceLocation(this.getRoutePath(relativeLocation, moduleName));
  }

  // ======================================================
  // HANDLERS
  // ======================================================


  // ======================================================
  // RENDERS
  // ======================================================


  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      children,
      match,
      location,
      moduleToRoutePrefixMap,
    } = this.props;

    return (
      <ContextModules.Provider
        value={{
          getFullPath: this.getFullPath,
          getRoutePath: this.getRoutePath,
          onGoTo: this.onGoTo,
          onReplaceLocation: this.onReplaceLocation,
          match,
          location,
          moduleToRoutePrefixMap,
        }}
      >
        { children }
      </ContextModules.Provider>
    );
  }
}
