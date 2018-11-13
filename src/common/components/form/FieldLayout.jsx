import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

// import i18n from '../../utils/i18n';

import getComponents from '../../get-components';

const { UnescapedHtml } = getComponents();

require('./FieldLayout.css');

export default class FieldLayout extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    label: PropTypes.node,
    children: PropTypes.node,
    errors: PropTypes.arrayOf(PropTypes.string),
    warnings: PropTypes.arrayOf(PropTypes.string),
    touched: PropTypes.bool,
    textDescription: PropTypes.node,
  };

  render() {
    const {
      className,
      label,
      children,
      errors,
      warnings,
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
              <UnescapedHtml
                className="FieldLayout__description"
                html={ textDescription }
              />
            )
          }
          {
            warnings.length > 0 && (
              <div className="FieldLayout__warnings">
                {
                  warnings.map((warning) => (
                    <div
                      key={ warning }
                      className="FieldLayout__warningLabel"
                    >
                      { warning }
                    </div>
                  ))
                }
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
