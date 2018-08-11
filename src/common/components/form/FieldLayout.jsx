import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

// import i18n from '../../utils/i18n';

import './FieldLayout.css';

export default class FieldLayout extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    label: PropTypes.node,
    children: PropTypes.node,
    errors: PropTypes.arrayOf(PropTypes.string),
    touched: PropTypes.bool,
    textDescription: PropTypes.node,
  };

  render() {
    const {
      className,
      label,
      children,
      errors,
      touched,
      textDescription,
    } = this.props;

    return (
      <div className={ `FieldLayout ${className || ''} ${touched ? 'FieldLayout--touched' : ''}` }>
        <label className="FieldLayout__label">
          { label }
        </label>
        <div className="FieldLayout__content">
          <div className="FieldLayout__control">
            { children }
          </div>
          {
            textDescription && (
              <div className="FieldLayout__description">
                { textDescription }
              </div>
            )
          }
          {
            errors.length > 0 && (
              <div className="FieldLayout__errors">
                {
                  errors.map((error) => (
                    <div
                      key={ error }
                      className="FieldLayout__errorLabel"
                    >
                      { error }
                    </div>
                  ))
                }
              </div>
            )
          }
        </div>
      </div>
    );
  }
}
