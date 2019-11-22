import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

// import i18n from '../../utils/i18n';

import getComponents from '../../get-components';

const {
  Label,
} = getComponents();

require('./FieldsetLayout.css');

export default class FieldsetLayout extends PureComponent {
  static propTypes = {
    className: PropTypes.string,

    label: PropTypes.node,
    children: PropTypes.node,
  };

  renderLabel() {
    const {
      label,
    } = this.props;

    return label && (
      <Label className="FieldsetLayout__label">
        { label }
      </Label>
    );
  }

  renderField() {
    return this.props.children;
  }

  render() {
    const {
      className,
    } = this.props;

    return (
      <div className={ `FieldsetLayout ${className || ''}` }>
        { this.renderLabel() }

        <div className="FieldsetLayout__content">
          { this.renderField() }
        </div>
      </div>
    );
  }
}
