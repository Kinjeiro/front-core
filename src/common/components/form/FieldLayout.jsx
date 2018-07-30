import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

// import i18n from '../../utils/i18n';

import './FieldLayout.css';

export default class FieldLayout extends PureComponent {
  static propTypes = {
    label: PropTypes.node,
    children: PropTypes.node,
  };

  render() {
    const {
      label,
      children,
    } = this.props;

    return (
      <div className="FieldLayout">
        <label className="FieldLayout__label">
          { label }
        </label>
        <div className="FieldLayout__control">
          { children }
        </div>
      </div>
    );
  }
}
