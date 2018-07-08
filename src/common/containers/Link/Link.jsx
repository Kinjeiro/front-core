import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router';

import AuthCheckWrapper from '../AuthCheckWrapper/AuthCheckWrapper';

import './Link.css';

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

    let childrenFinal = children;
    if (checkAuth || permissions) {
      childrenFinal = (
        <AuthCheckWrapper
          { ...otherProps }
          permissions={ permissions }
          linkForwardTo={ to }
        >
          { childrenFinal }
        </AuthCheckWrapper>
      );
    }

    return (
      <RouterLink
        { ...otherProps }
        to={ to }
        className={ `Link ${className || ''}` }
      >
        { childrenFinal }
      </RouterLink>
    );
  }
}
