import PropTypes from 'prop-types';

import CONSTRAINTS from './model-constraints';

export const TYPES = {
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
};

export const SUB_TYPES = {
  LOGIN: 'login',
  PASSWORD: 'password',
  EMAIL: 'email',
  PHONE: 'phone',
};

export const FIELD_PROP_TYPE_MAP = {
  type: PropTypes.oneOf(Object.values(TYPES)),
  subType: PropTypes.oneOf(Object.values(SUB_TYPES)),

  name: PropTypes.string,
  label: PropTypes.node,
  value: PropTypes.any,
  /**
   * Значение которое будет отображаться
   */
  valueName: PropTypes.node,
  emptyValue: PropTypes.node,
  options: PropTypes.array,
  simpleText: PropTypes.bool,
  multiple: PropTypes.bool,
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
   */
  constraints: CONSTRAINTS,

  textPlaceholder: PropTypes.node,
  textHint: PropTypes.node,

  context: PropTypes.object,
  compareFn: PropTypes.func,
  className: PropTypes.string,

  controlProps: PropTypes.object,

  onChange: PropTypes.func,
  /**
   * обычно для больших форм, чтобы сэкономить ресурсы значение применяется после потери фокуса или Enter
   * Это сделано и для input
   *
   * Но бывают случаи когда нужно реально по символьно обновлять (когда данных мало и нужно явно показать что кнопка больше не дисеблится (к примеру, при форме логине)
   * Значеие true - как раз и включает нотификацию по мере ввода
   */
  instanceChange: PropTypes.bool,

  onAdd: PropTypes.func,
  textOnAdd: PropTypes.node,
  onRemove: PropTypes.func,
  textOnRemove: PropTypes.node,
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
