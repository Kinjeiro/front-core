import memoizeOne from 'memoize-one';
import PropTypes from 'prop-types';

/* eslint-disable no-param-reassign */
import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import bind from 'lodash-decorators/bind';
import omit from 'lodash/omit';
import memoizeBind from 'memoize-bind';

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

// ======================================================
// MODULE
// ======================================================
import i18n from '../../i18n';

import {
  FIELD_PROP_TYPE_MAP,
  FIELD_TYPES,
  FIELD_SUB_TYPES,
} from '../../model-field';

import getCb from '../../get-components';
import { createSimpleSelectRecord, parseArrayToSelectRecords } from '../../model-select-option';

const CB = getCb();
const { FieldLayout } = CB;

require('./CoreField.css');

export default class CoreField extends Component {
  static TYPES = FIELD_TYPES;
  static SUB_TYPES = FIELD_SUB_TYPES;

  static propTypes = FIELD_PROP_TYPE_MAP;

  static defaultProps = {
    type: FIELD_TYPES.STRING,
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

    const isShallowEqual = shallowEqual(nextState, this.state)
      && shallowEqual(
        otherProps,
        omit(this.props, 'context', 'controlProps', 'formDependentData'),
      )
      && shallowEqual(context, this.props.context)
      && shallowEqual(controlProps, this.props.controlProps);

    return !isShallowEqual
      || !deepEquals(formDependentData, this.props.formDependentData);
  }

  componentWillReceiveProps(newProps) {
    const {
      formDependentData,
    } = newProps;
    if (!deepEquals(formDependentData, this.props.formDependentData)) {
      this.validateComponent(newProps);
    }
  }

  componentDidUpdate(prevProps/* , prevState, snapshot */) {
    const {
      value,
    } = this.props;

    if (!deepEquals(value, prevProps.value)) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        lastValue: value,
      });
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
      case FIELD_TYPES.DATE: {
        const systemFormat = type === FIELD_TYPES.DATE ? SYSTEM_DATE_FORMAT : SYSTEM_DATETIME_FORMAT;
        return parseDate(value, null, systemFormat);
      }
      default:
        return value;
    }
  }
  static parseOutValue(type = FIELD_TYPES.TEXT, value = null, props = {}) {
    const {
      multiple,
      controlClass,
    } = props;

    if (controlClass && controlClass.parseOutValue) {
      return controlClass.parseOutValue(type, value, props);
    }

    switch (type) {
      // case TYPES.DATETIME:
      case FIELD_TYPES.DATE: {
        const dateFormat = type === FIELD_TYPES.DATE ? DATE_FORMAT : DATETIME_FORMAT;
        const systemFormat = type === FIELD_TYPES.DATE ? SYSTEM_DATE_FORMAT : SYSTEM_DATETIME_FORMAT;
        const dates = wrapToArray(value)
          .map((valueItem) => parseDate(valueItem, systemFormat, dateFormat));
        return multiple ? dates : dates[0];
      }
      default:
        return value;
    }
  }
  static isEmptyValue(type = FIELD_TYPES.TEXT, value = null, props = {}) {
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
   * @param props - если LIST - то нужно records, componentProps: fieldLabel \ fieldId - если они отличаются от стандартных
   * @returns {*}
   */
  static parseValueToString(type, value, customMask = null, props = {}) {
    const { controlClass } = props;

    if (controlClass && controlClass.isEmptyValue) {
      return controlClass.isEmptyValue(type, value, customMask, props);
    }

    const typeFinal = type || CoreField.TYPES.TEXT;

    switch (typeFinal) {
      case FIELD_TYPES.BOOLEAN:
        // todo @ANKU @LOW - локализаци
        return value ? 'Да' : 'Нет';

      case FIELD_TYPES.DATETIME:
      case FIELD_TYPES.DATE: {
        const dateFormat = typeFinal === FIELD_TYPES.DATE ? DATE_FORMAT : DATETIME_FORMAT;
        const systemFormat = typeFinal === FIELD_TYPES.DATE ? SYSTEM_DATE_FORMAT : SYSTEM_DATETIME_FORMAT;
        return parseDate(value, customMask || dateFormat, systemFormat);
      }

      case FIELD_TYPES.LIST:
        return CB.Select.getSelectedRecordLabel
          ? CB.Select.getSelectedRecordLabel({
            value,
            selectedValue: value,
            records: props.options,
            ...props.controlProps,
          })
          : value;

      case FIELD_TYPES.STRING:
      case FIELD_TYPES.NUMERIC:
      case FIELD_TYPES.DECIMAL:
      case FIELD_TYPES.TEXT:
      case FIELD_TYPES.CUSTOM:
        return value;

      case FIELD_TYPES.BINARY:
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
      label,
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
        errors.push(i18n('components.CoreField.errors.requiredErrorWithoutFieldName'));
        // if (typeof label === 'string') {
        //   errors.push(i18n('components.CoreField.errors.requiredError', {
        //     fieldName: label,
        //   }));
        // } else {
        //   errors.push(i18n('components.CoreField.errors.requiredErrorWithoutFieldName'));
        // }
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
  async validateComponent(props = this.props, value = undefined, state = this.state) {
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

    const errors = await CoreField.validate(valueFinal, props, elementDom, getFormData);
    this.setState({
      lastValue: valueFinal,
      errors,
    });

    if (elementDom && !elementDom.validationMessage) {
      // для инпутов кастомные ошибки - https://codepen.io/jmalfatto/pen/YGjmaJ?editors=0010
      elementDom.setCustomValidity(errors.length > 0 ? errors[0] : '');
    }
  }

  getConstrains() {
    // todo @ANKU @LOW - можно вынести в state с помощью удобного нового static метода props to state
    const {
      constraints,
    } = this.props;

    // мы должны всегда перепроверять результаты функции, ибо значения могут меняться
    let hasFunc = false;

    const constraintsResult = Object.keys(constraints).reduce((result, constraintKey) => {
      const value = constraints[constraintKey];
      if (typeof value === 'function') {
        hasFunc = true;
      }
      result[constraintKey] = executeVariable(constraints[constraintKey], null, this.props);
      return result;
    }, {});

    return hasFunc ? constraintsResult : constraints;
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
  handleChange(value, multipleIndex, node = undefined, contextData = undefined) {
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
          ? parseOutValue(value, this.props, multipleIndex)
          : CoreField.parseOutValue(type, value, this.props),
        multiple ? multipleIndex : undefined,
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
        'isProcessing',
      );
    }
    return promiseChange;
  }

  handleChangeMultiple(multipleIndex, value) {
    return this.handleChange(value, multipleIndex);
  }

  handleChangeBoolean(multipleIndex, event, props) {
    return this.handleChange(
      (props && typeof props.checked !== 'undefined')
        ? props.checked
        : typeof event.target.checked !== 'undefined'
          ? event.target.checked
          : event.target.value || event,
      multipleIndex,
    );
  }

  handleChangeDate(multipleIndex, date) {
    return this.handleChange(date, multipleIndex);
  }

  handleChangeCheckbox(multipleIndex, valuesOrNull, selectedRecords, contextCheckbox) {
    return this.handleChange(valuesOrNull, multipleIndex, contextCheckbox);
  }
  handleChangeList(multipleIndex, value, selectedRecords, contextSelect) {
    return this.handleChange(value, multipleIndex, contextSelect);
  }

  handleChangeDefault(multipleIndex, value, node, contextData) {
    return this.handleChange(value, multipleIndex, node, contextData);
  }


  // ======================================================
  // HANDLE MULTIPLE
  // ======================================================

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


  // handleEmitProcessing(eventName, prevHandler, ...args) {
  //   return emitProcessing(prevHandler(...args), this);
  // }
  handlersWrapToPromiseChangingMemoizeOne = memoizeOne(
    (controlProps, eventNames) => {
      const wrappers = {};
      eventNames.forEach((eventName) => {
        const prevHandler = controlProps[eventName];
        if (prevHandler) {
          wrappers[eventName] = (...args) => emitProcessing(prevHandler(...args), this, 'isProcessing');
          // wrappers[eventName] = memoizeBind(this.handleEmitProcessing, this, eventName, prevHandler);
        }
      });
      return wrappers;
    },
  );
  handlersWrapToPromiseChanging(controlProps, eventNames) {
    return this.handlersWrapToPromiseChangingMemoizeOne(controlProps, eventNames);
  }

  @bind()
  async handleTouch() {
    const {
      onTouch,
    } = this.props;
    await emitProcessing(
      Promise.all([
        onTouch ? onTouch() : Promise.resolve(),
        this.validateComponent(this.props),
      ]),
      this,
      'isProcessing',
    );
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
      emitProcessing(this.validateComponent(this.props, newValue), this, 'isProcessing');

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
      case FIELD_SUB_TYPES.LOGIN:
        return {
          // https://reactjs.org/docs/dom-elements.html - camelcase нужен
          autoComplete: 'username', // для менеджера пароля обязательно username название
          autoCorrect: 'off',
          spellCheck: 'false',
          autoCapitalize: 'off',
          autoFocus: 'autofocus',
          ...props,
        };
      case FIELD_SUB_TYPES.LOGIN_EMAIL:
        return {
          autoComplete: 'username',
          autoCorrect: 'off',
          spellCheck: 'false',
          autoCapitalize: 'off',
          autoFocus: 'autofocus',
          ...props,
          type: 'email',
        };

      case FIELD_SUB_TYPES.PASSWORD: {
        return {
          autoComplete: 'current-password',
          ...props,
          type: 'password',
        };
      }
      case FIELD_SUB_TYPES.EMAIL: {
        return {
          ...props,
          type: 'email',
        };
      }
      case FIELD_SUB_TYPES.PHONE: {
        return {
          // todo @ANKU @LOW - могут быть и пробелы - ^((\+7|7|8)+[0-9-]{10,14})$ - https://www.regextester.com/94215
          pattern: '^((\\+7|7|8)+([0-9]){10})$',
          ...props,
          type: 'tel',
        };
      }
      default:
        return props;
    }
  }

  getControlProps(inValue, multipleIndex, constraints) {
    const {
      id,
      name,
      type,
      subType,
      /**
       * @deprecated - use controlProps.records
       */
      options,
      // value: inValue,
      // valueName,
      // emptyValue,

      placeholder,
      textPlaceholder,
      title,
      textHint,
      controlProps = {},
      onChange,
      instanceChange,
      readOnly,
      disabled,
      required: propsRequired,
      defaultValue,
      multiple,
      isProcessing: isProcessingFromProps,
      errors: errorsFromProps,
      warnings: warningsFromProps,
      touched: touchedFromProps,
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
      type,
      subType,
      errors: errorsFromProps || (Array.isArray(errors) && errors.length === 0 ? null : errors),
      warnings: warningsFromProps || warnings,
      touched: touchedFromProps || touched,
      defaultValue,
      multiple,
      ...controlProps,
      placeholder: placeholder || textPlaceholder,
      title,
      // textHint,
      readOnly: readOnly || !onChange || isProcessing,
      disabled: disabled || isProcessing,
      required: required || propsRequired,
      isProcessing: isProcessingFromProps || isProcessing,
      onBlur: this.handleBlur,
      onTouch: this.handleTouch,
    };
    Object.assign(
      controlPropsFinal,
      this.handlersWrapToPromiseChanging(
        controlPropsFinal,
        ['onMouseDown'],
      ),
    );
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

    let onChangeForCustom;

    switch (type) {
      case FIELD_TYPES.STRING:
      case FIELD_TYPES.NUMERIC:
      case FIELD_TYPES.DECIMAL:
      case FIELD_TYPES.TEXT:
        if (constraintsValues) {
          // todo @ANKU @LOW - возможно формат constraintsValues будет приходить от бэка более сложным и нужно будет этот мапинг переделать
          // Select
          return {
            // todo @ANKU @CRIT @MAIN - проверить
            selectedValue: controlValue,
            // options: constraintsValues.map((item) => ({ label: item, value: item })),
            records: constraintsValues.map((item) => createSimpleSelectRecord(item, item)),
            onChange: memoizeBind(this.handleChangeMultiple, this, multipleIndex),
            ...controlPropsFinal,
          };
        }

        const onChangeBlur = instanceChange ? undefined : this.handleInputChange;
        const onChangeFinal = instanceChange ? this.handleInputChange : undefined;

        if (type === FIELD_TYPES.TEXT) {
          // TextArea
          return {
            maxLength,
            minLength,
            // value: controlValue,
            onChangedBlur: onChangeBlur,
            onChange: onChangeFinal,
            indexItem: multipleIndex,
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
          type: type === FIELD_TYPES.DECIMAL ? 'number' : type,
          min: minValue,
          max: maxValue,
          maxLength,
          minLength,
          pattern,
          onChangedBlur: onChangeBlur,
          onChange: onChangeFinal,
          indexItem: multipleIndex,
          ...controlPropsFinal,
        };
      case FIELD_TYPES.BOOLEAN:
        // Checkbox
        return {
          value: controlValue,
          selectedValue: controlValue,
          onFieldChange: memoizeBind(this.handleChangeCheckbox, this, multipleIndex),

          records: options,
          ...controlPropsFinal,
        };

      // case TYPES.DATETIME: @todo @Panin - есть бага при попытке переключиться на выбор времени.
      case FIELD_TYPES.DATETIME:
      case FIELD_TYPES.DATE: {
        const dateFormat = type === FIELD_TYPES.DATE ? DATE_FORMAT : DATETIME_FORMAT;

        // FC Components - DatePicker - https://github.com/airbnb/react-dates
        // todo @ANKU @LOW - нету времени - showTime
        // todo @ANKU @LOW - не проставлены границы - disabledDate
        // todo @ANKU @LOW - проверить что свои инпуты они проставляют type 'date' или 'datetime'
        // DatePicker
        return {
          // todo @ANKU @CRIT @MAIN - а для DATE сделать корный класс с внутренним состоянием (а то сейчас от неуправляемой формы приходит undefined
          // todo @ANKU @CRIT @MAIN - либо заиспользовать lastValue из state
          value: controlValue,
          placeholder: dateFormat,
          displayFormat: dateFormat,
          onChange: memoizeBind(this.handleChangeDate, this, multipleIndex),

          showTime: type === FIELD_TYPES.DATETIME,
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
      case FIELD_TYPES.LIST: {
        // Select
        const {
          fieldId,
          fieldLabel,
        } = controlPropsFinal;

        return {
          value: controlValue,
          selectedValue: controlValue,
          onFieldChange: memoizeBind(this.handleChangeList, this, multipleIndex),

          ...controlPropsFinal,
          records: parseArrayToSelectRecords(controlPropsFinal.records || options, fieldId, fieldLabel),
        };
      }

      // case TYPES.CUSTOM:
      // case TYPES.BINARY:
      //   // Attachment
      default:
        onChangeForCustom = memoizeBind(this.handleChangeDefault, this, multipleIndex);

        return {
          value: controlValue,
          constraints,
          warnings,
          onErrors: this.handleErrors,
          onWarnings: this.handleWarnings,
          ...controlPropsFinal,
          onChange: onChangeForCustom,
          onFieldChange: onChangeForCustom,
        };
    }
  }

  getControlClass(constraints) {
    const {
      type,
      subType,
      controlClass,
    } = this.props;

    const {
      values: constraintsValues,
    } = constraints;

    if (controlClass) {
      return controlClass;
    }

    switch (type) {
      case FIELD_TYPES.STRING:
      case FIELD_TYPES.NUMERIC:
      case FIELD_TYPES.DECIMAL:
      case FIELD_TYPES.TEXT:
        if (constraintsValues) {
          // todo @ANKU @LOW - возможно формат constraintsValues будет приходить от бэка более сложным и нужно будет этот мапинг переделать
          return CB.Select;
        }

        // if (type === FIELD_TYPES.STRING && subType === FIELD_SUB_TYPES.PHONE) {
        //   return CB.PhoneInput;
        // }
        // if (type === FIELD_TYPES.TEXT) {
        //   return CB.TextArea;
        // }

        return CB.Input;

      case FIELD_TYPES.BOOLEAN:
        // взято за основу Antd.Checkbox
        return CB.Checkbox;

      // case TYPES.DATETIME: @todo @Panin - есть бага при попытке переключиться на выбор времени.
      case FIELD_TYPES.DATETIME:
      case FIELD_TYPES.DATE: {
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
      case FIELD_TYPES.LIST: {
        return CB.Select;
      }

      case FIELD_TYPES.BINARY: {
        return CB.Attachment;
      }
      case FIELD_TYPES.CUSTOM: {
        return null;
      }
      default:
        console.error('Field неизвестный тип поля', type);
        return null;
    }
  }

  renderFieldItem(inValue, multipleIndex, constraints) {
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

    const controlPropsFinal = this.getControlProps(inValue, multipleIndex, constraints);

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
      case FIELD_TYPES.BINARY:
      case FIELD_TYPES.LIST:
      case FIELD_TYPES.BOOLEAN:
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
      textHint,
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
        isProcessing={ isProcessing }
        textHint={ textHint }

        textDescription={ textDescription }
        errors={ touched && !isProcessing ? errors : undefined }
        warnings={ warnings }

        required={ required || propsRequired }
        touched={ touched }
      >
        { this.renderMultiple(constraints) }
      </Layout>
    );
  }
}
