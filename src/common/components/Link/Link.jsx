import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router';

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
  };

  static defaultProps = RouterLink.getDefaultProps();

  render() {
    return (
      <RouterLink
        { ...this.props }
        className={ `Link ${this.props.className || ''}` }
      />
    );
  }
}
