import React from 'react';
import PropTypes from 'prop-types';

import CONSTRAINTS from './model-constraints';

export const FIELD_TYPES = {
  STRING: 'text',
  TEXT: 'textarea',
  DATE: 'date',
  DATETIME: 'datetime',
  NUMERIC: 'number',
  DECIMAL: 'decimal',
  BOOLEAN: 'checkbox',
  REFERENCE: 'radio',
  LIST: 'select',
  /* DYNAMIC,
   */
  BINARY: 'binary',
  CUSTOM: 'custom',

  GROUPING: '_GROUPING',
};
/**
 * @deprecated - use FIELD_TYPES
 * @type {{STRING: string, TEXT: string, DATE: string, DATETIME: string, NUMERIC: string, DECIMAL: string, BOOLEAN: string, REFERENCE: string, LIST: string, BINARY: string, CUSTOM: string}}
 */
export const TYPES = FIELD_TYPES;

export const GROUPING_ATTRIBUTE_INNER_FIELDS = 'fields';

export const FIELD_SUB_TYPES = {
  LOGIN: 'login',
  LOGIN_EMAIL: 'loginEmail',
  PASSWORD: 'password',
  EMAIL: 'email',
  PHONE: 'phone',
};
/**
 * @deprecated FIELD_SUB_TYPES
 * @type {{LOGIN: string, LOGIN_EMAIL: string, PASSWORD: string, EMAIL: string, PHONE: string}}
 */
export const SUB_TYPES = FIELD_SUB_TYPES;

export const FIELD_PROP_TYPE_MAP = {
  type: PropTypes.oneOf(Object.values(FIELD_TYPES)),
  subType: PropTypes.oneOf(Object.values(FIELD_SUB_TYPES)),

  name: PropTypes.string,
  /**
   * по умолчанию <form_id>_<name>
   */
  id: PropTypes.string,

  simpleText: PropTypes.bool,
  value: PropTypes.any,
  defaultValue: PropTypes.any,
  /**
   * Значение которое будет отображаться
   */
  valueName: PropTypes.node,
  emptyValue: PropTypes.node,

  className: PropTypes.string,

  readOnly: PropTypes.bool,
  disabled: PropTypes.bool,

  // ======================================================
  // ADDITIONAL - LAYOUT
  // ======================================================
  /**
   * в локализованных файлах могут автоматически подсасываться значения, к приеру
   pages: {
    SignupPage: {
      title: 'Sign up',
      fields: {
        username: {
          label: 'Login',
          placeholder: 'Enter login',
          title: 'User login',
        },
        password: {
          label: 'Password',
          placeholder: 'Enter password',
          title: 'User password',
          hint: 'Password should be very strong',
          description: 'Digits and latin symbols only',
        },
      },
     ...
     }
   }

   из локализации это '<field_name>.label'
   */
  label: PropTypes.node,
  /**
   * из локализации это '<field_name>.placeholder'
   */
  placeholder: PropTypes.node,
  /**
   * @deprecated - use placeholder
   */
  textPlaceholder: PropTypes.node,
  /**
   * то, что появляется над контролом при наведении средствами html
   * из локализации это '<field_name>.title'
   */
  title: PropTypes.string,
  /**
   * специальная иконка справа при наведении показывается дополнительная информация
   * из локализации это '<field_name>.hint'
   */
  textHint: PropTypes.node,
  /**
   * то, что показывает под полем
   * из локализации это '<field_name>.description'
   */
  textDescription: PropTypes.node,
  /**
   className

   label
   textDescription
   errors

   required
   touched
   */
  Layout: PropTypes.any,


  // ======================================================
  // VALUE CHANGE
  // ======================================================
  /**
   * (fieldName, parseOutValue, multiple, context, node) => {}
   */
  onChange: PropTypes.func,
  /**
   * (value, fieldProps, index) => parsedValue
   */
  parseOutValue: PropTypes.func,
  /**
   * обычно для больших форм, чтобы сэкономить ресурсы значение применяется после потери фокуса или Enter
   * Это сделано и для input
   *
   * Но бывают случаи когда нужно реально по символьно обновлять (когда данных мало и нужно явно показать что кнопка больше не дисеблится (к примеру, при форме логине)
   * Значеие true - как раз и включает нотификацию по мере ввода
   */
  instanceChange: PropTypes.bool,

  context: PropTypes.object,
  compareFn: PropTypes.func,


  // ======================================================
  // для листовых
  // ======================================================
  multiple: PropTypes.bool,
  // нужно в controlProps.records проставлять
  // records: PropTypes.array,

  /**
   * (fieldName, index, null, context) => {}
   */
  onAdd: PropTypes.func,
  textOnAdd: PropTypes.node,
  /**
   * (fieldName, index, itemValue, context) => {}
   */
  onRemove: PropTypes.func,
  textOnRemove: PropTypes.node,


  // ======================================================
  // VALIDATION
  // ======================================================
  /**
   values
   maxLength
   minLength
   multipleMaxSize
   multipleMinSize
   maxSize
   minSize
   minValue
   maxValue,
   maxBytes,
   minBytes,
   value
   pattern
   required,
   */
  constraints: CONSTRAINTS,
  /**
    Дополнительная кастомная валидация, срабатывает после всех автоматических проверок (html5 валидации, required, constraints)

    То есть если поле required, то вам не нужно дополнительного его проверять на пустоту. Если только вы не хотите переделать дефолтное сообщение о пустоте.
    В таком случаем нужно будет вернуть массив (это полностью заменит уже найденные ошибки defaultErrors)

    (value, fieldProps, formDependentData, formData, defaultErrors) => result

    где result:
    - если false - если нет других ошибок, то добавляет "Ошибку"
    - если true | null | undefined - никак не влияет, возвращает другие автоматически найденные ошибки
    - если массив - полность перезаписывает автоматические найденные ошибки

    Пример:
      {
        label: 'Старый пароль',
        name: 'oldPassword',
        subType: FIELD_SUB_TYPES.PASSWORD,
        required: true,
      },
      {
        label: 'Новый пароль',
        name: 'newPassword',
        subType: FIELD_SUB_TYPES.PASSWORD,
        required: true,
        formDependentFields: ['oldPassword'],
        validate: (value, props, formDependentData) => (
          !value
          || value !== formDependentData.oldPassword
          || 'Новый пароль должен отличаться от старого'
        ),
      },

    Механизм:
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
      }
   */
  validate: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.func,
  ]),
  /**
   * дублирует поле constraints.required для удобства
   */
  required: PropTypes.bool,

  /**
   * Список других полей на форме от которых зависит текущее поле
   * Если есть - то будет подаваться formData в виде объекта и обновлять
   */
  formDependentFields: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  /**
   * значение зависимых полей
   */
  formDependentData: PropTypes.object,
  /**
   * Метод с формы, чтобы получить остальные контекстные формы
   * - функция - чтобы не перезагружать компонент, при смене других значений
   */
  getFormData: PropTypes.func,

  // ======================================================
  // ОСТАЛЬНОЙ ОБВЕС
  // ======================================================
  isProcessing: PropTypes.bool,

  errors: PropTypes.array,
  warnings: PropTypes.array,
  touched: PropTypes.bool,
  onTouch: PropTypes.func,
  onBlur: PropTypes.func,


  // ======================================================
  // INNER CONTROL
  // ======================================================
  /**
   * для листов нужно объявить:
   * {
   *    records - вместо options мы используем данные, потом они преобразуются в optionMeta и передаются в SelectView, а он уже отображет из них option node
   *    fieldId
   *    fieldLabel
   * }
   */
  controlProps: PropTypes.object,
  /**
   * ссылка на DOM
   * (field, dom) => {}
   */
  controlRef: PropTypes.func,
  /**
   * Класс - замена стандартному для контрола
   */
  controlClass: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.instanceOf(React.Component),
  ]),
  /**
   * Замена стандартной отрисовки
   * (controlPropsFinal, resultNode, fieldProps) => node
   */
  render: PropTypes.func,


  // ======================================================
  // TYPE = FIELD_TYPES.GROUPING
  // ======================================================
  // name
  // className
  [GROUPING_ATTRIBUTE_INNER_FIELDS]: PropTypes.array, // fields of FIELD_PROP_TYPE_MAP
  /**
   * (groupingField, index, innerFieldComponents, innerFieldProps) => {}
   */
  renderGrouping: PropTypes.func,
  nodeBefore: PropTypes.node,
  nodeAfter: PropTypes.node,
};

export function createField(name, value, otherProps = {}) {
  return {
    name,
    value,
    ...otherProps,
  };
}

export const FIELD_PROP_TYPE = PropTypes.shape(FIELD_PROP_TYPE_MAP);

export default FIELD_PROP_TYPE;
