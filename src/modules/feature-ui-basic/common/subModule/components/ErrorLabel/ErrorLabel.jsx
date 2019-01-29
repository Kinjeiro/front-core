import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

require('./ErrorLabel.css');

export default class ErrorLabel extends PureComponent {
  static propTypes = {
    isWarning: PropTypes.bool,
    className: PropTypes.string,
    children: PropTypes.node,
  };

  render() {
    const {
      className,
      isWarning,
      children,
    } = this.props;

    return (
      <div className={ `ErrorLabel ${className || ''} ${isWarning ? 'ErrorLabel--warning' : ''}` }>
        { children }
      </div>
    );
  }
}
