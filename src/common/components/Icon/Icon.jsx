import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

export default class Icon extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    name: PropTypes.string,
    children: PropTypes.node,
  };

  renderText() {
    const {
      name,
    } = this.props;

    switch (name) {
      case 'add': return '+';
      case 'delete': return '-';
      case 'remove': return 'x';
      default: return null;
    }
  }

  render() {
    const {
      className,
      children,
    } = this.props;

    return (
      <span className={ `Icon ${className || ''}` }>
        { this.renderText() }
        { children }
      </span>
    );
  }
}
