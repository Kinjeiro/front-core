/* eslint-disable no-param-reassign */
// todo @ANKU @LOW - @toCore
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import bind from 'lodash-decorators/bind';
import isEqual from 'lodash/isEqual';

import {
  executeVariable,
  isEmpty,
  wrapToArray,
} from '../../utils/common';
import {
  parseDate,
  SYSTEM_DATE_FORMAT,
  SYSTEM_DATETIME_FORMAT,
  DATE_FORMAT,
  DATETIME_FORMAT,
} from '../../utils/date-utils';

import i18n from '../../utils/i18n-utils';

import {
  FIELD_PROP_TYPE_MAP,
  TYPES,
  SUB_TYPES,
} from '../../models/model-field';

import getCb from '../../get-components';

// import i18n from '../../utils/i18n';

// import './CoreField.css';

const {
  FieldLayout,
  Input,
  TextArea,
  Select,
  DatePicker,
  Checkbox,
  Button,
  Attachment,
} = getCb();

export default class CoreField extends PureComponent {
  static TYPES = TYPES;
  static SUB_TYPES = SUB_TYPES;

  static propTypes = FIELD_PROP_TYPE_MAP;

  static defaultProps = {
    type: TYPES.STRING,
    compareFn: CoreField.defaultCompareFn,
    constraints: {},
    textOnAdd: '@@ Добавить',
    textOnRemove: undefined,
  };

  state = {
    changing: false,
    lastValue: this.props.value,
    errors: [],
    touched: false,
  };

  elementDom = null;

  // ======================================================
  // LIFECYCLE
  // ======================================================
  // static


  // ======================================================
  // UTILS
  // ======================================================
  static defaultCompareFn(newValue = null, oldValue = null/* , field = null */) {
    // undefined === null === ''
    // eslint-disable-next-line no-param-reassign
    newValue = newValue === '' ? null : newValue;
    // eslint-disable-next-line no-param-reassign
    oldValue = oldValue === '' ? null : oldValue;
    return isEqual(newValue, oldValue) ? 0 : 1;
  }
  static parseInValue(type, value) {
    switch (type) {
      // case TYPES.DATETIME:
      case TYPES.DATE: {
        const systemFormat = type === TYPES.DATE ? SYSTEM_DATE_FORMAT : SYSTEM_DATETIME_FORMAT;
        return parseDate(value, null, systemFormat);
      }
      default:
        return value;
    }
  }
  static parseOutValue(type = TYPES.TEXT, value = null) {
    switch (type) {
      // case TYPES.DATETIME:
      case TYPES.DATE: {
        const dateFormat = type === TYPES.DATE ? DATE_FORMAT : DATETIME_FORMAT;
        const systemFormat = type === TYPES.DATE ? SYSTEM_DATE_FORMAT : SYSTEM_DATETIME_FORMAT;
        return parseDate(value, systemFormat, dateFormat);
      }
      default:
        return value;
    }
  }

  /**
   *
   * @param type
   * @param value
   * @param customMask
   * @param props - если LIST - то нужно options, componentProps: fieldLabel \ fieldValue - если они отличаются от стандартных
   * @returns {*}
   */
  static parseValueToString(type, value, customMask = null, props = {}) {
    const typeFinal = type || CoreField.TYPES.TEXT;

    switch (typeFinal) {
      case TYPES.BOOLEAN:
        // todo @ANKU @LOW - локализаци
        return value ? 'Да' : 'Нет';

      case TYPES.DATETIME:
      case TYPES.DATE: {
        const dateFormat = typeFinal === TYPES.DATE ? DATE_FORMAT : DATETIME_FORMAT;
        const systemFormat = typeFinal === TYPES.DATE ? SYSTEM_DATE_FORMAT : SYSTEM_DATETIME_FORMAT;
        return parseDate(value, customMask || dateFormat, systemFormat);
      }

      case TYPES.LIST:
        return Select.getSelectedOptionLabel
          ? Select.getSelectedOptionLabel({
            selectedValue: value,
            options: props.options,
            ...props.controlProps,
          })
          : value;

      case TYPES.STRING:
      case TYPES.NUMERIC:
      case TYPES.DECIMAL:
      case TYPES.TEXT:
        return value;

      case TYPES.BINARY:
        return (Attachment && Attachment.parseValueToString && Attachment.parseValueToString(value))
          || value;

      default:
        console.warn('Field неизвестный тип поля', typeFinal);
        return '';
    }
  }

  static validate(value, props = {}, domRef = null) {
    const {
      name,
      required: propsRequired,
      constraints: {
        required,
      } = {},
      validate,
    } = props;

    const customValidateErrors = executeVariable(validate, [], value, props);
    if (customValidateErrors === true) {
      return [];
    }
    const errors = wrapToArray(customValidateErrors);
    if (domRef && domRef.checkValidity) {
      /*
       https://developer.mozilla.org/en-US/docs/Learn/HTML/Forms/Form_validation#The_HTML5_constraint_validation_API

       - validationMessage
       A localized message describing the validation constraints that the control does not satisfy (if any), or the empty string if the control is not a candidate for constraint validation (willValidate is false), or the element's value satisfies its constraints.

       - validity
       {
         badInput
         customError
         patternMismatch
         rangeOverflow
         rangeUnderflow
         stepMismatch
         tooLong
         tooShort
         typeMismatch
         valid
         valueMissing
       }
      */
      domRef.checkValidity();
      if (domRef.validationMessage) {
        errors.push(domRef.validationMessage);
      }
    } else {
      // code checking
      // eslint-disable-next-line no-lonely-if
      if ((propsRequired || required) && isEmpty(value)) {
        errors.push(i18n('core:components.CoreField.errors.requiredError', { fieldName: name }));
      }
    }

    return errors;
  }

  emitChanging(handlerPromise) {
    if (handlerPromise && handlerPromise.then) {
      this.setState({
        changing: true,
      });
      handlerPromise
        .then(() => {
          /*
           // todo @ANKU @LOW - warning.js:33 Warning: Can only update a mounted or mounting component. This usually means you called setState, replaceState, or forceUpdate on an unmounted component. This is a no-op.
           */
          this.setState({
            changing: false,
          });
        })
        .catch(() => {
          this.setState({
            changing: false,
          });
        });
    }
    return handlerPromise;
  }

  getConstrains() {
    // todo @ANKU @LOW - можно вынести в state с помощью удобного нового static метода props to state
    const {
      constraints,
    } = this.props;

    return Object.keys(constraints).reduce((result, constraintKey) => {
      result[constraintKey] = executeVariable(constraints[constraintKey], null, this.props);
      return result;
    }, {});
  }

  // ======================================================
  // HANDLERS
  // ======================================================
  @bind()
  controlRef(domElement) {
    const {
      controlRef,
    } = this.props;
    this.elementDom = domElement;
    if (controlRef) {
      controlRef(this.props, domElement);
    }
  }

  @bind()
  handleChange(value, index) {
    const {
      name,
      type,
      onChange,
      multiple,
      context,
      compareFn,
    } = this.props;
    const {
      lastValue,
    } = this.state;
    const {
      elementDom,
    } = this;

    let promiseChange = null;
    // eslint-disable-next-line eqeqeq
    if (onChange && compareFn(value, lastValue) !== 0) {
      promiseChange = onChange(
        name,
        CoreField.parseOutValue(type, value),
        multiple ? index : undefined,
        context,
      );

      const errors = CoreField.validate(value, this.props, elementDom);
      // todo @ANKU @LOW - promise не учитывается
      this.setState({
        lastValue: value,
        errors,
      });
      if (elementDom && !elementDom.validationMessage) {
        // для инпутов кастомные ошибки - https://codepen.io/jmalfatto/pen/YGjmaJ?editors=0010
        elementDom.setCustomValidity(errors.length ? errors[0] : '');
      }

      return this.emitChanging(promiseChange);
    }
    return promiseChange;
  }

  @bind()
  handleAdd() {
    const {
      name,
      value,
      onAdd,
      context,
    } = this.props;

    if (onAdd) {
      const index = value ? value.length : 0;
      return onAdd(name, index, null, context);
    }
    return null;
  }

  @bind()
  handleRemove(index, itemValue) {
    const {
      name,
      onRemove,
      context,
    } = this.props;

    if (onRemove) {
      return onRemove(name, index, itemValue, context);
    }
    return null;
  }


  handlersWrapToPromiseChanging(controlProps, eventNames) {
    const wrappers = {};
    eventNames.forEach((eventName) => {
      const prevHandler = controlProps[eventName];
      if (prevHandler) {
        wrappers[eventName] = (...args) => this.emitChanging(prevHandler(...args));
      }
    });
    return wrappers;
  }

  @bind()
  handleBlur(...args) {
    const {
      onBlur,
      value,
    } = this.props;

    this.setState({
      touched: true,
      errors: CoreField.validate(value, this.props, this.elementDom),
    });
    return onBlur && onBlur(...args);
  }

  // ======================================================
  // RENDERS
  // ======================================================
  updatePropsBySubType(props) {
    const {
      subType,
      name,
    } = this.props;

    switch (subType) {
      case SUB_TYPES.LOGIN:
        return {
          autoComplete: name,
          autoCorrect: 'off',
          spellCheck: 'false',
          autoCapitalize: 'off',
          autoFocus: 'autofocus',
          ...props,
        };
      case SUB_TYPES.LOGIN_EMAIL:
        return {
          autoComplete: 'username',
          // autoComplete: 'email',
          autoCorrect: 'off',
          spellCheck: 'false',
          autoCapitalize: 'off',
          autoFocus: 'autofocus',
          ...props,
          type: 'email',
        };

      case SUB_TYPES.PASSWORD: {
        return {
          autoComplete: 'current-password',
          ...props,
          type: 'password',
        };
      }
      case SUB_TYPES.EMAIL: {
        return {
          ...props,
          type: 'email',
        };
      }
      case SUB_TYPES.PHONE: {
        return {
          ...props,
          type: 'tel',
        };
      }
      default:
        return props;
    }
  }

  renderFieldItem(inValue, index, constraints) {
    const {
      name,
      type,
      options,
      // value: inValue,
      valueName,
      emptyValue,
      textPlaceholder,
      textHint,
      controlProps = {},
      onChange,
      instanceChange,
      readOnly,
      disabled,
      required: propsRequired,
    } = this.props;
    const {
      changing,
      errors,
      touched,
    } = this.state;

    const {
      values: constraintsValues,
      maxLength,
      minLength,
      // multipleMaxSize,
      // multipleMinSize,
      // maxSize,
      // minSize,
      minValue,
      maxValue,
      // value,
      pattern,
      required,
    } = constraints;

    let controlPropsFinal = {
      name,
      errors,
      touched,
      ...controlProps,
      placeholder: textPlaceholder,
      title: textHint,
      readOnly: readOnly || !onChange || changing,
      disabled: disabled || changing,
      required: required || propsRequired,
      onBlur: this.handleBlur,
      ...this.handlersWrapToPromiseChanging(controlProps, ['onMouseDown']),
    };
    controlPropsFinal = this.updatePropsBySubType(controlPropsFinal);

    /* if (controlClass) {
     return React.createElement(controlClass, {
     name,
     value: controlValue,
     errors,
     onChangedBlur: (event, { value }) => this.handleChange(field, value),
     ...allFieldsPropsOther,
     ...otherProps,
     });
     }*/

    /* const meta = {
     touched: errors.length > 0,
     error: errors,
     };*/

    if (typeof valueName !== 'undefined' && valueName !== null) {
      return valueName;
    }

    const controlValue = CoreField.parseInValue(type, inValue);

    if (controlValue === null && emptyValue) {
      return emptyValue;
    }

    switch (type) {
      case TYPES.STRING:
      case TYPES.NUMERIC:
      case TYPES.DECIMAL:
      case TYPES.TEXT:
        if (constraintsValues) {
          // todo @ANKU @LOW - возможно формат constraintsValues будет приходить от бэка более сложным и нужно будет этот мапинг переделать
          return (
            <Select
              selectedValue={ controlValue }
              options={ constraintsValues.map((item) => ({ label: item, value: item })) }
              onChange={ (value) => this.handleChange(value, index) }
              { ...controlPropsFinal }
            />
          );
        }

        const changeHandler = (event, { value }) => this.handleChange(value, index);
        const onChangeBlur = instanceChange ? undefined : changeHandler;
        const onChangeFinal = instanceChange ? changeHandler : undefined;

        if (type === TYPES.TEXT) {
          return (
            <TextArea
              maxLength={ maxLength }
              minLength={ minLength }
              onChangedBlur={ onChangeBlur }
              onChange={ onChangeFinal }
              { ...controlPropsFinal }
            >
              { controlValue }
            </TextArea>
          );
        }

        return (
          <Input
            controlRef={ this.controlRef }
            value={ controlValue || '' }
            type={ type === TYPES.DECIMAL ? 'number' : type }
            min={ minValue }
            max={ maxValue }
            maxLength={ maxLength }
            minLength={ minLength }
            pattern={ pattern }

            onChangedBlur={ onChangeBlur }
            onChange={ onChangeFinal }
            { ...controlPropsFinal }
          />
        );
      case TYPES.BOOLEAN:
        // взято за основу Antd.Checkbox
        return (
          <Checkbox
            checked={ controlValue }
            onChange={
              (event, props) =>
                this.handleChange(
                  props && typeof props.checked !== 'undefined'
                    ? props.checked
                    : typeof props.checked !== 'undefined'
                      ? event.target.checked
                      : event.target.value || event,
                  index,
                )
            }
            { ...controlPropsFinal }
          />
        );
      // case TYPES.DATETIME: @todo @Panin - есть бага при попытке переключиться на выбор времени.
      case TYPES.DATETIME:
      case TYPES.DATE: {
        const dateFormat = type === TYPES.DATE ? DATE_FORMAT : DATETIME_FORMAT;

        // FC Components - DatePicker - https://github.com/airbnb/react-dates
        // todo @ANKU @LOW - нету времени - showTime
        // todo @ANKU @LOW - не проставлены границы - disabledDate
        // todo @ANKU @LOW - проверить что свои инпуты они проставляют type 'date' или 'datetime'
        return (
          <DatePicker
            value={ controlValue }
            placeholder={ dateFormat }
            displayFormat={ dateFormat }
            onChange={ (event, time) => (
              event.target
                ? this.handleChange(time, index)
                : this.handleChange(event, index)
            ) }

            showTime={ type === TYPES.DATETIME }
            disabledDate={
              (minValue || maxValue)
                ? (dateValue) => {
                  let disableDate = false;
                  disableDate = disableDate || (minValue && dateValue < minValue);
                  disableDate = disableDate || (maxValue && dateValue > maxValue);
                  return disableDate;
                }
                : undefined
            }

            { ...controlPropsFinal }
          />
        );

        // // взято за основу Antd.DatePicker
        // return (
        //   <DatePicker
        //     value={ controlValue }
        //     format={ dateFormat }
        //     showTime={ type === TYPES.DATETIME }
        //     disabledDate={
        //       (minValue || maxValue)
        //         ? (dateValue) => {
        //           let disableDate = false;
        //           disableDate = disableDate || (minValue && dateValue < minValue);
        //           disableDate = disableDate || (maxValue && dateValue > maxValue);
        //           return disableDate;
        //         }
        //         : undefined
        //     }
        //     onChange={ (date, stringDate) => this.handleChange(stringDate, index) }
        //     { ...controlPropsFinal }
        //   />
        // );
      }
      case TYPES.LIST: {
        return (
          <Select
            selectedValue={ controlValue }
            options={ options }
            onSelect={ (id) => this.handleChange(id, index) }
            { ...controlPropsFinal }
          />
        );
      }

      case TYPES.BINARY: {
        return (
          <Attachment
            onChange={ this.handleChange }
            { ...controlPropsFinal }
          />
        );
      }
      default:
        console.error('Field неизвестный тип поля', type);
        return null;
    }
  }

  getSimpleValue(value) {
    const {
      emptyValue,
      valueName,
      type,
    } = this.props;

    return valueName || CoreField.parseValueToString(type, value, null, this.props) || emptyValue || null;
  }

  renderSimpleText() {
    const {
      value,
      multiple,
      className,
    } = this.props;

    if (!multiple) {
      return this.getSimpleValue(value);
    }

    const values = multiple ? value || [] : [value];

    let hasNode = false;
    const simpleValues = values
      .reduce((result, itemValue) => {
        const simpleValue = this.getSimpleValue(itemValue);
        if (simpleValue !== null && simpleValue !== '') {
          if (typeof simpleValue === 'object') {
            hasNode = true;
          }
          result.push(simpleValue);
        }
        return result;
      }, []);

    return hasNode
      ? (
        <span className={ `${className} CoreField--simple` }>
          { simpleValues.map((simpleValue, index) => (
            <span key={ index }>
              { simpleValue }
            </span>
          )) }
        </span>
      )
      : simpleValues.join(' ');
  }

  renderLabel() {
    const {
      label,
    } = this.props;

    // return (
    //   <span>{label}</span>
    // );
    return label;
  }
  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      name,
      value,
      simpleText,
      multiple,
      // constraints,

      className,

      onAdd,
      textOnAdd,
      onRemove,
      textOnRemove,
      required: propsRequired,
    } = this.props;
    const {
      errors,
      touched,
    } = this.state;

    if (simpleText) {
      return this.renderSimpleText();
    }

    const constraints = this.getConstrains();
    const {
      multipleMinSize = null,
      multipleMaxSize = null,
      required = null,
    } = constraints;
    const values = multiple ? value || [] : [value];
    const hasMin = (multipleMinSize !== null && values.length <= multipleMinSize)
      || ((required || propsRequired) && values.length <= 1);
    const hasMax = multiple && multipleMaxSize !== null && multipleMaxSize <= values.length;

    return (
      <FieldLayout
        className={ `CoreField ${className || ''}` }
        label={ this.renderLabel() }
        required={ required || propsRequired }
        key={ name }
        errors={ errors }
        touched={ touched }
      >
        {
          values.map((itemValue, index) => (
            <div
              key={ typeof itemValue !== 'object' || Math.random() }
              className={ `CoreField__multiple ${multiple && onRemove ? 'CoreField--withRemoveButton' : ''}` }
            >
              { this.renderFieldItem(itemValue, index, constraints) }
              {
                multiple && onRemove && !hasMin && (
                  <Button
                    className="CoreField__removeButton"
                    onClick={ () => this.handleRemove(index, itemValue) }
                    icon="minus"
                  >
                    { textOnRemove }
                  </Button>
                )
              }
            </div>
          ))
        }

        { multiple && onAdd && !hasMax && textOnAdd && (
          <div className="CoreField__addButton">
            <Button
              icon="plus"
              onClick={ this.handleAdd }
            >
              { textOnAdd }
            </Button>
          </div>
        ) }
      </FieldLayout>
    );
  }
}
