import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router';
// todo @ANKU @LOW - работа с hash в react-router 4\5 для 2\3 есть другое решение - https://github.com/rafrex/react-router-hash-link/tree/react-router-v2/3
// import { HashLink as RouterLink } from 'react-router-hash-link';

// import { cutContextPath } from '../../helpers/app-urls';

import getComponents from '../../get-components';
import { isAbsoluteUrl } from '../../utils/uri-utils';

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
      href,
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

    let toFinal = to;
    let hrefFinal = href;

    if (isAbsoluteUrl(to)) {
      toFinal = undefined;
      hrefFinal = to;
    }

    return (
      <AuthCheckWrapper
        checkAuth={ checkAuth }
        permissions={ permissions }
        linkForwardTo={ to }
      >
        <RouterLink
          { ...otherProps }
          to={ toFinal }
          href={ hrefFinal }
          className={ `Link ${className || ''}` }
        >
          { children }
        </RouterLink>
      </AuthCheckWrapper>
    );
  }
}
