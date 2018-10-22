import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router';

// import { cutContextPath } from '../../helpers/app-urls';

import getComponents from '../../get-components';

const { AuthCheckWrapper } = getComponents();

require('./Link.css');

/*
* Обертка над react-router чтобы потом при перехода на 4 версию ничего не отвалилвалось
*/
export default class Link extends Component {
  static propTypes = {
    /*
     to: oneOfType([string, object, func]),
     activeStyle: object,
     activeClassName: string,
     onlyActiveOnIndex: bool.isRequired,
     onClick: func,
     target: string
    */
    ...RouterLink.propTypes,
    className: PropTypes.string,
    checkAuth: PropTypes.bool,
    permissions: AuthCheckWrapper.propTypes.permissions,
  };

  static defaultProps = RouterLink.getDefaultProps();

  render() {
    const {
      children,
      checkAuth,
      permissions,
      to,
      className,
      ...otherProps
    } = this.props;

    // const toFinal = typeof to === 'string'
    //   ? cutContextPath(to)
    //   : typeof to === 'object'
    //     ? {
    //       ...to,
    //       pathname: to.pathname ? cutContextPath(to.pathname) : to.pathname,
    //     }
    //     : to;

    return (
      <AuthCheckWrapper
        checkAuth={ checkAuth }
        permissions={ permissions }
        linkForwardTo={ to }
      >
        <RouterLink
          { ...otherProps }
          to={ to }
          className={ `Link ${className || ''}` }
        >
          { children }
        </RouterLink>
      </AuthCheckWrapper>
    );
  }
}
