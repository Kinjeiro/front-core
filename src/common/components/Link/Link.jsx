import React, { Component } from 'react';
import { Link as RouterLink } from 'react-router';

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
  };

  static defaultProps = {
    ...RouterLink.getDefaultProps(),
  };

  render() {
    return (
      <RouterLink { ...this.props }  />
    );
  }
}
