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
    moduleName: PropTypes.string,
    modulePath: PropTypes.string,
    modulePathHash: PropTypes.string,
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
      moduleName,
      modulePath,
      modulePathHash,
    } = this.props;

    return (
      <Link
        { ...pick(this.props, Object.keys(Link.propTypes)) }
        to={
          getRoutePath(
            modulePathHash
              ? `${modulePath || '/'}#${modulePathHash}`
              : modulePath,
            moduleName,
          )
        }
      >
        { children }
      </Link>
    );
  }
}
