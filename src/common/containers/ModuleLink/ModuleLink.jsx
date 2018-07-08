import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Link from '../../components/Link/Link';
import contextModules from '../../contexts/ContextModules/decorator-context-modules';

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
    getFullPath: PropTypes.func,
  };

  static defaultProps = Link.defaultProps;

  render() {
    const {
      children,
      getFullPath,
      modulePath,
      moduleName,
      onGoTo,
      ...otherProps
    } = this.props;

    return (
      <Link
        { ...otherProps }
        to={ getFullPath(modulePath, moduleName) }
      >
        { children }
      </Link>
    );
  }
}
