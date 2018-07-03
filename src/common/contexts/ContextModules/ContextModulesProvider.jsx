import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { push } from 'react-router-redux';
import bind from 'lodash-decorators/bind';

import { joinUri } from '../../utils/uri-utils';

import { actions as modulesActions } from '../../app-redux/reducers/app/redux-modules';
// import i18n from '../../utils/i18n';

// import './ModuleRouteProvider.scss';

const ContextModules = React.createContext({
  getFullPath: null,
  goTo: null,
});

export const ContextModulesConsumer = ContextModules.Consumer;

@withRouter
@connect(
  (globalState) => ({
  }),
  {
    ...modulesActions,
    actionGoTo: push,
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
  };

  static defaultProps = {
    moduleToRoutePrefixMap: {},
  };

  // ======================================================
  // LIFECYCLE
  // ======================================================
  componentWllMount() {
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
  /**
   * Полный путь до ресурса с учетом префикса различных модулей
   * @param relativeLocation - LocationDescription - see model-location.js
   * @param moduleName
   * @returns {*}
   */
  @bind()
  getFullPath(relativeLocation, moduleName = null) {
    const {
      moduleToRoutePrefixMap,
    } = this.props;

    const prefix = moduleToRoutePrefixMap[moduleName];

    if (!prefix) {
      return relativeLocation;
    }

    if (typeof relativeLocation === 'object') {
      return {
        ...relativeLocation,
        pathname: joinUri('/', prefix, relativeLocation.pathname),
      };
    }

    return joinUri('/', prefix, relativeLocation);
  }

  @bind()
  onGoTo(relativeLocation, moduleName = null) {
    const {
      actionGoTo,
    } = this.props;
    return actionGoTo(this.getFullPath(relativeLocation, moduleName));
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
    } = this.props;

    return (
      <ContextModules.Provider
        value={{
          getFullPath: this.getFullPath,
          onGoTo: this.onGoTo,
          match,
          location,
        }}
      >
        { children }
      </ContextModules.Provider>
    );
  }
}
