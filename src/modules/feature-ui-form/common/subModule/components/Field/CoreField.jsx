/* eslint-disable no-param-reassign */
import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import bind from 'lodash-decorators/bind';
import omit from 'lodash/omit';

import {
  executeVariable,
  isEmpty,
  wrapToArray,
  emitProcessing,
  shallowEqual,
  deepEquals,
} from '../../../../../../common/utils/common';
import {
  parseDate,
  SYSTEM_DATE_FORMAT,
  SYSTEM_DATETIME_FORMAT,
  DATE_FORMAT,
  DATETIME_FORMAT,
} from '../../../../../../common/utils/date-utils';

import i18n from '../../i18n';

import {
  FIELD_PROP_TYPE_MAP,
  TYPES,
  SUB_TYPES,
} from '../../../../../../common/models/model-field';

import getCb from '../../../../../../common/get-components';

const CB = getCb();
const { FieldLayout } = CB;

export default class CoreField extends Component {
  static TYPES = TYPES;
  static SUB_TYPES = SUB_TYPES;

  static propTypes = FIELD_PROP_TYPE_MAP;

  static defaultProps = {
    type: TYPES.STRING,
    compareFn: CoreField.defaultCompareFn,
    constraints: {},
    textOnAdd: '@@ Добавить',
    textOnRemove: undefined,
    Layout: FieldLayout,
  };

  state = {
    isProcessing: false,
    lastValue: this.props.value,
    errors: [],
    warnings: [],
    touched: false,
  };

  elementDom = null;

  // ======================================================
  // LIFECYCLE
  // ======================================================
  // static
  shouldComponentUpdate(nextProps, nextState) {
    const {
      context,
      controlProps,
      formDependentData,
      ...otherProps
    } = nextProps;

    const isShallowEqual =
      shallowEqual(nextState, this.state)
      && shallowEqual(
        otherProps,
        omit(this.props, 'context', 'controlProps', 'formDependentData'),
      )
      && shallowEqual(context, this.props.context)
      && shallowEqual(controlProps, this.props.controlProps);
    const isDeepEquals = deepEquals(formDependentData, this.props.formDependentData);
    return !isShallowEqual || !isDeepEquals;
  }

  componentWillReceiveProps(newProps) {
    const {
      formDependentData,
    } = newProps;
    if (!deepEquals(formDependentData, this.props.formDependentData)) {
      this.validateComponent(newProps);
    }
  }

  // ======================================================
  // STATIC
  // ======================================================
  static defaultCompareFn(newValue = null, oldValue = null/* , field = null */, props = {}) {
    const { controlClass } = props;

    if (controlClass && controlClass.defaultCompareFn) {
      return controlClass.defaultCompareFn(newValue, oldValue, props);
    }

    // undefined === null === ''
    // eslint-disable-next-line no-param-reassign
    newValue = newValue === '' ? null : newValue;
    // eslint-disable-next-line no-param-reassign
    oldValue = oldValue === '' ? null : oldValue;
    return deepEquals(newValue, oldValue) ? 0 : 1;
  }

  static parseInValue(type, value, props = {}) {
    const { controlClass } = props;

    if (controlClass && controlClass.parseInValue) {
      return controlClass.parseInValue(type, value, props);
    }

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
  static parseOutValue(type = TYPES.TEXT, value = null, props = {}) {
    const { controlClass } = props;

    if (controlClass && controlClass.parseOutValue) {
      return controlClass.parseOutValue(type, value, props);
    }

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
  static isEmptyValue(type = TYPES.TEXT, value = null, props = {}) {
    const {
      controlClass,
    } = props;

    const valueArray = wrapToArray(value);
    const isEmptyCustom = controlClass && controlClass.isEmptyValue;

    return valueArray.every((valueItem) => {
      if (isEmptyCustom) {
        return isEmptyCustom(type, valueItem, props);
      }

      // switch (type) {
      //   // case TYPES.DATETIME:
      //   case TYPES.BINARY: {
      //     // todo @ANKU @CRIT @MAIN - InstantlyAttachment требуте downloadUrl а обычный нет - только из пропс
      //     return !value || !value.id;
      //   }
      //   default:
      //     return isEmpty(value);
      // }

      return isEmpty(valueItem);
    });
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
    const { controlClass } = props;

    if (controlClass && controlClass.isEmptyValue) {
      return controlClass.isEmptyValue(type, value, customMask, props);
    }

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
        return CB.Select.getSelectedOptionLabel
          ? CB.Select.getSelectedOptionLabel({
            selectedValue: value,
            options: props.options,
            ...props.controlProps,
          })
          : value;

      case TYPES.STRING:
      case TYPES.NUMERIC:
      case TYPES.DECIMAL:
      case TYPES.TEXT:
      case TYPES.CUSTOM:
        return value;

      case TYPES.BINARY:
        return (CB.Attachment && CB.Attachment.parseValueToString && CB.Attachment.parseValueToString(value))
          || value;

      default:
        console.warn('Field неизвестный тип поля', typeFinal);
        return '';
    }
  }

  static async validate(value, fieldProps = {}, domRef = null, getFormData = null) {
    const {
      type,
      name,
      required: propsRequired,
      constraints: {
        required,
        multipleMaxSize,
        multipleMinSize,
      } = {},
      validate,
      multiple,
      formDependentData,

      controlClass,
    } = fieldProps;

    // let errors = [];
    let errors = [];

    if (controlClass && controlClass.validate) {
      const staticValidateError = await controlClass.validate(value, fieldProps, domRef, getFormData);
      if (Array.isArray(staticValidateError)) {
        errors.push(...staticValidateError);
      }
    }

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
      // todo @ANKU @LOW @HACK @BUG_OUT @html5 - если поле readOnly или disabled то проверка не проходит
      const {
        disabled,
        readOnly,
      } = domRef;
      domRef.disabled = false;
      domRef.readOnly = false;
      domRef.checkValidity();
      if (domRef.validationMessage && domRef.validationMessage !== errors[0]) {
        errors.push(domRef.validationMessage);
      }
      domRef.disabled = disabled;
      domRef.readOnly = readOnly;
    } else {
      // code checking
      // eslint-disable-next-line no-lonely-if
      if ((propsRequired || required) && CoreField.isEmptyValue(type, value, fieldProps)) {
        errors.push(i18n('components.CoreField.errors.requiredError', {
          fieldName: name,
        }));
      }
    }

    if (multiple) {
      const values = wrapToArray(value);
      if (typeof multipleMinSize !== 'undefined' && values.length < multipleMinSize) {
        errors.push(i18n('components.CoreField.errors.multipleMinSize', {
          fieldName: name,
          multipleMinSize,
        }));
      }
      if (typeof multipleMaxSize !== 'undefined' && values.length > multipleMaxSize) {
        errors.push(i18n('components.CoreField.errors.multipleMaxSize', {
          fieldName: name,
          multipleMaxSize,
        }));
      }
    }


    if (validate) {
      try {
        const formDataFinal = {
          ...(await executeVariable(getFormData, null, {})),
          [name]: value,
        };
        const customValidateErrors = await executeVariable(
          validate,
          null,
          value,
          fieldProps,
          formDependentData,
          formDataFinal,
          errors,
        );
        if (customValidateErrors === false) {
          if (errors.length === 0) {
            // если нет никаких ошибок - добавляется
            // если есть - не проставляем, пока другие не уберутся
            // todo @ANKU @LOW - @@loc
            errors.push('Ошибка');
          }
        } else if (customValidateErrors === true || customValidateErrors === null) {
          // возвращаем errors, какие есть
        } else if (typeof customValidateErrors === 'string') {
          // добавляем к текущим
          errors.push(customValidateErrors);
        } else if (Array.isArray(customValidateErrors)) {
          // польностью заменяем массив
          errors = customValidateErrors;
        } else if (typeof customValidateErrors === 'object') {
          /*
           процесс валидации может закончиться с warnings и successMessages
           к примеру, мы проверяем уникальность нового email и если успешно проверили - то нужно показать пользователю зеленое сообщение что адрес свободен
          */
          // todo @ANKU @LOW -
        }
      } catch (uniError) {
        console.debug('Field validate error', uniError);
        errors.push(uniError.uniMessages || uniError.message);
      }
    }

    return errors;
  }

  // ======================================================
  // UTILS
  // ======================================================
  validateComponent(props = this.props, value = undefined, state = this.state) {
    const {
      elementDom,
    } = this;
    const {
      getFormData,
    } = props;

    const valueFinal = typeof value === 'undefined' ? props.value : value;

    if (elementDom && elementDom.validity.customError) {
      // убираем кастомное сообщение перед проверкой
      elementDom.setCustomValidity('');
    }
    this.setState({
      errors: [],
      warnings: [],
    });
    const validatePromise = CoreField.validate(valueFinal, props, elementDom, getFormData)
      .then((errors) => {
        this.setState({
          lastValue: valueFinal,
          errors,
        });
        if (elementDom && !elementDom.validationMessage) {
          // для инпутов кастомные ошибки - https://codepen.io/jmalfatto/pen/YGjmaJ?editors=0010
          elementDom.setCustomValidity(errors.length > 0 ? errors[0] : '');
        }
      });

    return validatePromise;
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

  // todo @ANKU @LOW - вынести в отдельные фабричные филды
  @bind()
  handleInputChange(event, { value, indexItem }) {
    return this.handleChange(value, indexItem, event);
  }

  @bind()
  handleChange(value, index, node = undefined, contextData = undefined) {
    const {
      name,
      type,
      onChange,
      multiple,
      context,
      compareFn,
      parseOutValue,
    } = this.props;
    const {
      lastValue,
    } = this.state;

    let promiseChange = null;
    // eslint-disable-next-line eqeqeq
    if (onChange && compareFn(value, lastValue) !== 0) {
      promiseChange = onChange(
        name,
        parseOutValue
          ? parseOutValue(value, this.props, index)
          : CoreField.parseOutValue(type, value, this.props),
        multiple ? index : undefined,
        contextData && typeof contextData === 'object'
          ? { ...contextData, ...context }
          : context,
        node,
      );

      return emitProcessing(
        Promise.all([
          promiseChange,
          this.validateComponent(this.props, value),
        ]),
        this,
      );
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
        wrappers[eventName] = (...args) => emitProcessing(prevHandler(...args), this);
      }
    });
    return wrappers;
  }

  @bind()
  async handleTouch() {
    await emitProcessing(this.validateComponent(this.props), this);
    this.setState({
      touched: true,
    });
  }

  @bind()
  async handleBlur(event, controlProps) {
    const {
      controlProps: {
        onBlur,
      } = {},
      value: oldValue,
    } = this.props;
    const {
      touched,
    } = this.state;
    const newValue = controlProps
      ? controlProps.value
      : event.relatedTarget
        ? event.relatedTarget.value
        // todo @ANKU @LOW - что делать если не вернули?
        // : undefined;
        : oldValue;

    // для первой валидации
    if (!touched) {
      emitProcessing(this.validateComponent(this.props, newValue), this);

      // this.handleTouch();
      this.setState({
        touched: true,
      });
    }

    return onBlur && onBlur(event, controlProps);
  }

  @bind()
  handleErrors(errors, replace = false) {
    this.setState({
      errors: replace
        ? wrapToArray(errors)
        : [...this.state.errors, ...wrapToArray(errors)],
    });
  }
  @bind()
  handleWarnings(warnings, replace = false) {
    this.setState({
      warnings: replace
        ? wrapToArray(warnings)
        : [...this.state.warnings, ...wrapToArray(warnings)],
    });
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
          pattern: '^((\\+7|7|8)+([0-9]){10})$',
          ...props,
          type: 'tel',
        };
      }
      default:
        return props;
    }
  }

  getControlProps(inValue, index, constraints) {
    const {
      id,
      name,
      type,
      options,
      // value: inValue,
      // valueName,
      // emptyValue,
      textPlaceholder,
      textHint,
      controlProps = {},
      onChange,
      instanceChange,
      readOnly,
      disabled,
      required: propsRequired,
      defaultValue,
      multiple,
      // render,
    } = this.props;
    const {
      isProcessing,
      errors,
      warnings,
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
      id,
      name,
      errors: Array.isArray(errors) && errors.length === 0 ? null : errors,
      touched,
      defaultValue,
      multiple,
      ...controlProps,
      placeholder: textPlaceholder,
      title: textHint,
      readOnly: readOnly || !onChange || isProcessing,
      disabled: disabled || isProcessing,
      required: required || propsRequired,
      isProcessing,
      onBlur: this.handleBlur,
      onTouch: this.handleTouch,
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

    // if (typeof valueName !== 'undefined' && valueName !== null) {
    //   return valueName;
    // }

    const controlValue = CoreField.parseInValue(type, inValue, this.props);

    // if (controlValue === null && emptyValue) {
    //   return emptyValue;
    // }

    switch (type) {
      case TYPES.STRING:
      case TYPES.NUMERIC:
      case TYPES.DECIMAL:
      case TYPES.TEXT:
        if (constraintsValues) {
          // todo @ANKU @LOW - возможно формат constraintsValues будет приходить от бэка более сложным и нужно будет этот мапинг переделать
          // Select
          return {
            selectedValue: controlValue,
            options: constraintsValues.map((item) => ({ label: item, value: item })),
            onChange: (value) => this.handleChange(value, index),
            ...controlPropsFinal,
          };
        }

        const onChangeBlur = instanceChange ? undefined : this.handleInputChange;
        const onChangeFinal = instanceChange ? this.handleInputChange : undefined;

        if (type === TYPES.TEXT) {
          // TextArea
          return {
            maxLength,
            minLength,
            // value: controlValue,
            onChangedBlur: onChangeBlur,
            onChange: onChangeFinal,
            indexItem: index,
            withState: !instanceChange,
            ...controlPropsFinal,
            children: controlValue,
          };
        }

        // Input
        return {
          controlRef: this.controlRef,
          value: controlValue || '',
          withState: !instanceChange,
          type: type === TYPES.DECIMAL ? 'number' : type,
          min: minValue,
          max: maxValue,
          maxLength,
          minLength,
          pattern,
          onChangedBlur: onChangeBlur,
          onChange: onChangeFinal,
          indexItem: index,
          ...controlPropsFinal,
        };
      case TYPES.BOOLEAN:
        // взято за основу Antd.Checkbox
        // Checkbox
        return {
          checked: controlValue,
          onChange: (event, props) =>
            this.handleChange(
              (props && typeof props.checked !== 'undefined')
                ? props.checked
                : typeof event.target.checked !== 'undefined'
                  ? event.target.checked
                  : event.target.value || event,
              index,
            ),
          ...controlPropsFinal,
        };

      // case TYPES.DATETIME: @todo @Panin - есть бага при попытке переключиться на выбор времени.
      case TYPES.DATETIME:
      case TYPES.DATE: {
        const dateFormat = type === TYPES.DATE ? DATE_FORMAT : DATETIME_FORMAT;

        // FC Components - DatePicker - https://github.com/airbnb/react-dates
        // todo @ANKU @LOW - нету времени - showTime
        // todo @ANKU @LOW - не проставлены границы - disabledDate
        // todo @ANKU @LOW - проверить что свои инпуты они проставляют type 'date' или 'datetime'
        // DatePicker
        return {
          value: controlValue,
          placeholder: dateFormat,
          displayFormat: dateFormat,
          onChange: (event, time) => (
            event.target
              ? this.handleChange(time, index)
              : this.handleChange(event, index)
          ),

          showTime: type === TYPES.DATETIME,
          disabledDate: (minValue || maxValue)
            ? (dateValue) => {
              let disableDate = false;
              disableDate = disableDate || (minValue && dateValue < minValue);
              disableDate = disableDate || (maxValue && dateValue > maxValue);
              return disableDate;
            }
            : undefined,
          ...controlPropsFinal,
        };
      }
      case TYPES.LIST: {
        // Select
        return {
          selectedValue: controlValue,
          options,
          onSelect: (id, node, contextSelect) => this.handleChange(id, index, contextSelect),
          ...controlPropsFinal,
        };
      }

      // case TYPES.CUSTOM:
      // case TYPES.BINARY:
      //   // Attachment
      default:
        return {
          value: controlValue,
          constraints,
          warnings,
          onErrors: this.handleErrors,
          onWarnings: this.handleWarnings,
          ...controlPropsFinal,
          onChange: (value, node, contextData) => this.handleChange(value, index, node, contextData),
        };
    }
  }

  getControlClass(constraints) {
    const {
      type,
      controlClass,
    } = this.props;

    const {
      values: constraintsValues,
    } = constraints;

    if (controlClass) {
      return controlClass;
    }

    switch (type) {
      case TYPES.STRING:
      case TYPES.NUMERIC:
      case TYPES.DECIMAL:
      case TYPES.TEXT:
        if (constraintsValues) {
          // todo @ANKU @LOW - возможно формат constraintsValues будет приходить от бэка более сложным и нужно будет этот мапинг переделать
          return CB.Select;
        }

        if (type === TYPES.TEXT) {
          return CB.TextArea;
        }

        return CB.Input;

      case TYPES.BOOLEAN:
        // взято за основу Antd.Checkbox
        return CB.Checkbox;

      // case TYPES.DATETIME: @todo @Panin - есть бага при попытке переключиться на выбор времени.
      case TYPES.DATETIME:
      case TYPES.DATE: {
        return CB.DatePicker;

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
        return CB.Select;
      }

      case TYPES.BINARY: {
        return CB.Attachment;
      }
      case TYPES.CUSTOM: {
        return null;
      }
      default:
        console.error('Field неизвестный тип поля', type);
        return null;
    }
  }

  renderFieldItem(inValue, index, constraints) {
    const {
      type,
      valueName,
      emptyValue,
      render,
    } = this.props;

    if (typeof valueName !== 'undefined' && valueName !== null) {
      return valueName;
    }

    const controlValue = CoreField.parseInValue(type, inValue, this.props);

    if (controlValue === null && emptyValue) {
      return emptyValue;
    }

    const controlPropsFinal = this.getControlProps(inValue, index, constraints);

    let resultControl = null;
    const ControlClass = this.getControlClass(constraints);
    if (ControlClass) {
      resultControl = React.createElement(ControlClass, controlPropsFinal);
    }

    if (render) {
      resultControl = render(controlPropsFinal, resultControl, this.props);
    }

    return resultControl;
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


  renderMultiple(constraints) {
    const {
      type,
      value = null,
      multiple,
      instanceChange,

      onAdd,
      textOnAdd,
      onRemove,
      textOnRemove,
      required: propsRequired,
    } = this.props;

    const {
      multipleMinSize = null,
      multipleMaxSize = null,
      required = null,
    } = constraints;

    switch (type) {
      case TYPES.BINARY:
        // эти типы сами разберутся с multiple
        // todo @ANKU @LOW - а вообще пора уже выделять в Factory и добавлять как листнеры
        return (
          <div className="CoreField__controlItem">
            { this.renderFieldItem(value, null, constraints) }
          </div>
        );

      default: {
        const values = multiple ? value || [] : [value];
        // const values = Array.isArray(value)
        //   ? value.length === 0
        //                  // всегда должно быть одно значение, чтобы его изменяли
        //                  ? [undefined]
        //                  : value
        //   : [value];

        const hasMin = (multipleMinSize !== null && values.length <= multipleMinSize)
          || ((required || propsRequired) && values.length <= 1);
        const hasMax = multiple && multipleMaxSize !== null && multipleMaxSize <= values.length;

        return (
          <React.Fragment>
            {
              values.map((itemValue, index) => (
                <div
                  key={ multiple && !instanceChange ? JSON.stringify(itemValue) : index }
                  className={ `CoreField__controlItem ${multiple && onRemove ? 'CoreField--withRemoveButton' : ''}` }
                >
                  { this.renderFieldItem(itemValue, index, constraints) }
                  {
                    multiple && onRemove && !hasMin && (
                      <CB.Button
                        className="CoreField__removeButton"
                        onClick={ () => this.handleRemove(index, itemValue) }
                        icon="minus"
                      >
                        { textOnRemove }
                      </CB.Button>
                    )
                  }
                </div>
              ))
            }

            { multiple && onAdd && !hasMax && textOnAdd && (
              <div className="CoreField__addButton">
                <CB.Button
                  icon="plus"
                  onClick={ this.handleAdd }
                >
                  { textOnAdd }
                </CB.Button>
              </div>
            ) }
          </React.Fragment>
        );
      }
    }
  }
  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      name,
      simpleText,
      multiple,

      className,
      textDescription,

      required: propsRequired,

      Layout = CB.FieldLayout,
    } = this.props;
    const {
      errors,
      warnings,
      touched,
      isProcessing,
    } = this.state;

    if (simpleText) {
      return this.renderSimpleText();
    }

    const constraints = this.getConstrains();
    const {
      required = null,
    } = constraints;

    const classNameFinal = `\
      CoreField\
      ${className || ''}\
      ${multiple ? 'CoreField--multiple' : ''}\
      ${propsRequired || required ? 'CoreField--required' : ''}\
      ${touched ? 'CoreField--touched' : ''}\
      ${isProcessing ? 'CoreField--isProcessing' : ''}\
      ${touched && errors && errors.length > 0 ? 'CoreField--error' : ''}\
    `;

    return (
      <Layout
        key={ name }

        className={ classNameFinal }

        label={ this.renderLabel() }
        textDescription={ textDescription }
        errors={ touched && !isProcessing ? errors : undefined }
        warnings={ warnings }

        required={ required || propsRequired }
        touched={ touched }
        isProcessing={ isProcessing }
      >
        { this.renderMultiple(constraints) }
      </Layout>
    );
  }
}
