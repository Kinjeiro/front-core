/* eslint-disable global-require */
import React from 'react';

import {
  executeVariable,
  executeVariableMemoize,
} from '../utils/common';

const COMPONENTS_BASE = {
  replace(name, ComponentClass, funcIsClass = false) {
    Object.defineProperty(this, name, {
      enumerable: true,
      configurable: true,
      get() {
        return funcIsClass
          ? ComponentClass
          // отложенная загрузка компонентов () => require('./Component);
          : executeVariableMemoize(name, ComponentClass);
      },
    });
    return this;
  },
  wrap(name, ComponentClass, funcIsClass = false) {
    const prev = this[name];
    if (!prev) {
      this.replace(name, ComponentClass, funcIsClass);
    } else {
      this.replace(
        name,
        (props) => React.createElement(
          funcIsClass
            ? ComponentClass
            : executeVariable(ComponentClass),
          props,
          React.createElement(prev, props),
        ),
        true,
      );
    }
    return this;
  },
  addClassName(name, className) {
    const prev = this[name];
    if (prev) {
      this.replace(
        name,
        (props) => React.createElement(
          prev,
          {
            ...props,
            className: `${className} ${props.className || ''}`,
          },
        ),
        true,
      );
    }
    return this;
  },


  // ======================================================
  // FORM UI
  // ======================================================
  get Form() {
    return require('./form/CoreForm').default;
  },
  get FormLayout() {
    return require('./form/FormLayout').default;
  },
  get Field() {
    return require('./form/CoreField').default;
  },
  get FieldLayout() {
    return require('./form/FieldLayout').default;
  },

  // ======================================================
  // FORM FIELDS
  // ======================================================
  BaseInput: (props) => <input { ...props } />,
  BaseTextArea: (props) => <textarea { ...props } />,
  BaseNumberInput: (props) => <input { ...props } type="number" />,
  get Input() {
    return require('./form/fields/CoreInput').default;
  },

  BaseSelect: (props) => <select { ...props } />,
  BaseOption: (props) => <option { ...props } />,
  get Select() {
    return require('./form/fields/CoreSelect').default;
  },

  DatePicker: () => null,
  Checkbox: (props) => <input { ...props } type="checkbox" />,

  // ======================================================
  // UI
  // ======================================================
  get Loading() {
    return require('./Loading/Loading').default;
  },
  get Button() {
    return (props) => (<button { ...props } />);
  },
  get Link() {
    return require('./Link/Link').default;
  },
  get ActionStatus() {
    return require('./ActionStatus/ActionStatus').default;
  },
  get Notifications() {
    return require('./Notifications/Notifications').default;
  },
  get Notice() {
    return require('./Notifications/Notice').default;
  },
  get Modal() {
    return null;
  },
  get Info404() {
    return require('./Info404/Info404').default;
  },
};

export default COMPONENTS_BASE;
