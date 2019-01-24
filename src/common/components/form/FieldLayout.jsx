import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

// import i18n from '../../utils/i18n';

import getComponents from '../../get-components';

const {
  UnescapedHtml,
  Loading,
} = getComponents();

require('./FieldLayout.css');

export default class FieldLayout extends PureComponent {
  static propTypes = {
    label: PropTypes.node,
    children: PropTypes.node,
    errors: PropTypes.arrayOf(PropTypes.string),
    warnings: PropTypes.arrayOf(PropTypes.string),

    className: PropTypes.string,
    touched: PropTypes.bool,
    required: PropTypes.bool,
    isProcessing: PropTypes.bool,
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
      isProcessing,
    } = this.props;

    return (
      <div className={ `FieldLayout ${className || ''} ${touched ? 'FieldLayout--touched' : ''}` }>
        <label className="FieldLayout__label">
          { label }
        </label>
        <div className="FieldLayout__content">
          <div className="FieldLayout__control">
            {
              isProcessing && (
                <div className="FieldLayout__processingWrapper">
                  <Loading className="FieldLayout__processing" />
                </div>
              )
            }
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
            errors && errors.length > 0 && (
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
