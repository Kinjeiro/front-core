/* eslint-disable no-unused-vars */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import bind from 'lodash-decorators/bind';

import getComponents from '../../../get-components';

const {
  BaseNumberInput,
  BaseTextArea,
  BaseInput,
} = getComponents();

export default class CoreInput extends PureComponent {
  static propTypes = {
    // ...input.propTypes
    controlRef: PropTypes.func,
    withState: PropTypes.bool,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    indexItem: PropTypes.number,
    type: PropTypes.string,
    readOnly: PropTypes.bool,
    InputClass: PropTypes.func,
    errors: PropTypes.arrayOf(PropTypes.string),
    title: PropTypes.string,

    onChangedBlur: PropTypes.func,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    onKeyPress: PropTypes.func,
  };

  static defaultProps = {
    withState: true,
    type: 'text',
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
    if (this.props.type !== 'textarea' && event.key === 'Enter') {
      this.update(true, true, event, ...other);
    }

    if (this.props.onKeyPress) {
      this.props.onKeyPress(event, ...other);
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
  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      type,
      InputClass,
      withState, // убираем из остальных пропертей
      onChangedBlur, // убираем из остальных пропертей
      indexItem,
      title,
      errors,
      ...inputProps
    } = this.props;

    let InputClassFinal = InputClass;
    if (!InputClassFinal) {
      switch (type) {
        case 'textarea':
          InputClassFinal = BaseTextArea;
          break;
        case 'number':
          InputClassFinal = BaseNumberInput;
          break;
        default:
          InputClassFinal = BaseInput;
      }
    }

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

