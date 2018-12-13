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
  CUSTOM: 'custom',
};

export const SUB_TYPES = {
  LOGIN: 'login',
  LOGIN_EMAIL: 'loginEmail',
  PASSWORD: 'password',
  EMAIL: 'email',
  PHONE: 'phone',
};

export const FIELD_PROP_TYPE_MAP = {
  type: PropTypes.oneOf(Object.values(TYPES)),
  subType: PropTypes.oneOf(Object.values(SUB_TYPES)),

  name: PropTypes.string.isRequired,
  /**
   * по умолчанию <form_id>_<name>
   */
  id: PropTypes.string,
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
        subType: SUB_TYPES.PASSWORD,
        required: true,
      },
      {
        label: 'Новый пароль',
        name: 'newPassword',
        subType: SUB_TYPES.PASSWORD,
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
  readOnly: PropTypes.bool,
  disabled: PropTypes.bool,

  textPlaceholder: PropTypes.node,
  textHint: PropTypes.node,
  textDescription: PropTypes.node,

  context: PropTypes.object,
  compareFn: PropTypes.func,
  className: PropTypes.string,

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

  /**
   * (value, index, contextData, node) => {}
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

  onAdd: PropTypes.func,
  textOnAdd: PropTypes.node,
  onRemove: PropTypes.func,
  textOnRemove: PropTypes.node,

  /**
   className

   label
   textDescription
   errors

   required
   touched
   */
  Layout: PropTypes.any,

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
