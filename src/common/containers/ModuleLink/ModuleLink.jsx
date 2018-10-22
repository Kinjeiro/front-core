import React, { Component } from 'react';
import PropTypes from 'prop-types';
import pick from 'lodash/pick';

import contextModules from '../../contexts/ContextModules/decorator-context-modules';

import getComponents from '../../get-components';

const {
  Link,
} = getComponents();

@contextModules()
export default class ModuleLink extends Component {
  static propTypes = {
    // ======================================================
    // PROPS
    // ======================================================
    ...Link.propTypes,
    modulePath: PropTypes.string,
    moduleName: PropTypes.string,
    children: PropTypes.node,

    // ======================================================
    // @contextModules
    // ======================================================
    getRoutePath: PropTypes.func,
    onGoTo: PropTypes.func,
  };

  static defaultProps = Link.defaultProps;

  render() {
    const {
      children,
      getRoutePath,
      modulePath,
      moduleName,
    } = this.props;

    return (
      <Link
        { ...pick(this.props, Object.keys(Link.propTypes)) }
        to={ getRoutePath(modulePath, moduleName) }
      >
        { children }
      </Link>
    );
  }
}
