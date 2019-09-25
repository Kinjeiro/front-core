/* eslint-disable no-unused-vars,react/require-default-props */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import bind from 'lodash-decorators/bind';

import getComponents from '../../../get-components';
import { FIELD_SUB_TYPES, FIELD_TYPES } from '../../../model-field';

const {
  BaseNumberInput,
  BaseTextArea,
  BaseInput,
  PhoneInput,
} = getComponents();

export default class CoreInput extends PureComponent {
  static propTypes = {
    // ...input.propTypes

    // from CoreField
    type: PropTypes.string,
    subType: PropTypes.string,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    readOnly: PropTypes.bool,
    errors: PropTypes.arrayOf(PropTypes.string),
    title: PropTypes.string,
    controlRef: PropTypes.func,

    // other
    withState: PropTypes.bool,
    indexItem: PropTypes.number,

    InputClass: PropTypes.func,

    onChangedBlur: PropTypes.func,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    onKeyPress: PropTypes.func,
  };

  static defaultProps = {
    withState: true,
    type: FIELD_TYPES.STRING,
    errors: [],
  };

  state = {
    tempValue: this.props.withState ? this.props.value : undefined,
    lastChangedBlurValue: undefined,
  };

  // ======================================================
  // LIFECYCLE
  // ======================================================
  // componentDidMount() {
  // }
  componentWillReceiveProps(newProps) {
    const {
      withState,
      value,
    } = newProps;
    const {
      tempValue,
    } = this.state;
    // eslint-disable-next-line eqeqeq
    if (withState && value != tempValue) {
      this.setState({
        tempValue: value,
      });
    }
  }

  getValueFromEvent(event) {
    // todo @ANKU @LOW - или проверить с типом эвент
    return typeof event === 'object' && event.target
      ? event.target.value
      : event;
  }

  /**
   *
   * @param withBlur
   * @param withChange
   * @param event
   * @param comp
   */
  update(withBlur, withChange, event, comp, ...other) {
    const {
      type,
      onChange,
      onBlur,
      onChangedBlur,
      readOnly,
    } = this.props;

    const {
      lastChangedBlurValue,
      tempValue,
    } = this.state;

    const newValue = this.getValueFromEvent(event);

    const value = type === 'number'
      ? +newValue
      : newValue;

    const hasChanges = newValue !== lastChangedBlurValue;

    if (withChange && onChange) {
      onChange(event, { ...comp, value }, ...other);
    }
    if (withBlur && onBlur) {
      onBlur(event, { ...comp, value });
    }
    if (withBlur && onChangedBlur && hasChanges && !readOnly) {
      onChangedBlur(event, { ...comp, value }, ...other);
      this.setState({
        lastChangedBlurValue: value,
      });
    }
  }

  // ======================================================
  // HANDLERS
  // ======================================================
  @bind()
  handleChange(event, comp, ...other) {
    const {
      withState,
    } = this.props;
    const {
      tempValue,
    } = this.state;

    const newValue = this.getValueFromEvent(event);

    this.update(false, true, event, comp, ...other);

    if (withState && tempValue !== newValue) {
      this.setState({
        tempValue: newValue,
      });
    }
  }

  @bind()
  handleBlur(event, ...other) {
    this.update(true, false, event, ...other);
  }

  @bind()
  handleKeyPress(event, ...other) {
    const {
      type,
      onKeyPress,
    } = this.props;

    if (type !== FIELD_TYPES.TEXT && event.key === 'Enter') {
      this.update(true, true, event, ...other);
    }

    if (onKeyPress) {
      onKeyPress(event, ...other);
    }
  }

  getControlValue() {
    const {
      value,
      withState,
    } = this.props;
    const {
      tempValue,
    } = this.state;

    return withState
      ? typeof tempValue !== 'undefined'
        ? tempValue
        : value
     : value;
  }

  getInputViewClass() {
    const {
      type,
      subType,
      InputClass,
    } = this.props;

    if (InputClass) {
      return InputClass;
    }
    switch (type) {
      case FIELD_TYPES.TEXT:
        return BaseTextArea;
      case FIELD_TYPES.NUMERIC:
        return BaseNumberInput;
      default:
        if (subType === FIELD_SUB_TYPES.PHONE) {
          return PhoneInput;
        }
        return BaseInput;
    }
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      type,
      subType,
      InputClass,
      withState, // убираем из остальных пропертей
      onChangedBlur, // убираем из остальных пропертей
      indexItem,
      title,
      errors,
      ...inputProps
    } = this.props;

    const InputClassFinal = this.getInputViewClass();

    return (
      <InputClassFinal
        { ...inputProps }
        errors={ Array.isArray(errors) && errors.length === 0 ? undefined : errors }
        title={ errors && errors.length > 0 ? errors[0] : title }
        value={ this.getControlValue() }
        type={ type }
        onChange={ this.handleChange }
        onKeyPress={ this.handleKeyPress }
        onBlur={ this.handleBlur }
      />
    );
  }
}

