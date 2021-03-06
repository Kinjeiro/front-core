import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

// import i18n from '../../utils/i18n';

import getComponents from '../../get-components';

const {
  UnescapedHtml,
  Label,
  Loading,
  ErrorLabel,
  Hint,
} = getComponents();

require('./FieldLayout.css');

export default class FieldLayout extends PureComponent {
  static propTypes = {
    className: PropTypes.string,

    label: PropTypes.node,
    children: PropTypes.node,
    textHint: PropTypes.node,

    textDescription: PropTypes.node,

    errors: PropTypes.arrayOf(PropTypes.string),
    warnings: PropTypes.arrayOf(PropTypes.string),
    /**
     * @deprecated - в CoreField--touched есть
     */
    touched: PropTypes.bool,
    required: PropTypes.bool,
    isProcessing: PropTypes.bool,
  };

  renderLabel() {
    const {
      label,
    } = this.props;

    return label && (
      <Label className="FieldLayout__label">
        { label }
      </Label>
    );
  }

  renderProcessing() {
    const {
      isProcessing,
    } = this.props;

    return isProcessing && (
      <div className="FieldLayout__processingWrapper">
        <Loading className="FieldLayout__processing" />
      </div>
    );
  }

  renderField() {
    return this.props.children;
  }

  renderHint() {
    const {
      textHint,
    } = this.props;

    return (textHint === 0 || textHint)
      ? (
        <Hint
          className="FieldLayout__hint"
        >
          { textHint }
        </Hint>
      )
      : undefined;
  }

  renderDescription() {
    const {
      textDescription,
    } = this.props;

    return textDescription && (
      <UnescapedHtml
        className="FieldLayout__description"
        html={ textDescription }
      />
    );
  }

  renderWarnings() {
    const {
      warnings,
    } = this.props;

    return warnings && warnings.length > 0 && (
      <div className="FieldLayout__warnings">
        {
          warnings.map((warning, index) => (
            <ErrorLabel
              key={ typeof warning === 'string' ? warning : index }
              isWarning={ true }
            >
              { warning }
            </ErrorLabel>
          ))
        }
      </div>
    );
  }
  renderErrors() {
    const {
      errors,
    } = this.props;

    return errors && errors.length > 0 && (
      <div className="FieldLayout__errors">
        {
          errors.map((error, index) => (
            <ErrorLabel
              key={ typeof error === 'string' ? error : index }
            >
              { error }
            </ErrorLabel>
          ))
        }
      </div>
    );
  }

  renderContent() {
    return (
      <div className="FieldLayout__content">
        <div className="FieldLayout__control">
          { this.renderProcessing() }
          { this.renderField() }
          { this.renderHint() }
        </div>
        { this.renderDescription() }

        { this.renderWarnings() }
        { this.renderErrors() }
      </div>
    );
  }

  render() {
    const {
      className,
      touched,
    } = this.props;

    return (
      <div className={ `FieldLayout ${className || ''} ${touched ? 'FieldLayout--touched' : ''}` }>
        { this.renderLabel() }
        { this.renderContent() }
      </div>
    );
  }
}
