import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

export default class Segment extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
  };

  render() {
    const {
      children,
      className,
    } = this.props;

    return (
      <div className={ `Segment ${className || ''}` }>
        { children }
      </div>
    );
  }
}
