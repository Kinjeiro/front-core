import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

// import i18n from '../../i18n';
// import getComponents from '../../get-components';

export default class Hint extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.string,
  };

  static defaultProps = {
  };

  render() {
    const {
      className,
      children,
    } = this.props;

    return (
      <div className={ `Hint ${className || ''}` }>
        { children }
      </div>
    );
  }
}
