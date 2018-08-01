/* eslint-disable global-require */
import React from 'react';

import logger from '../helpers/client-logger';

import {
  executeVariable,
  executeVariableMemoize,
} from '../utils/common';

const COMPONENTS_BASE = {
  replace(name, ComponentClass) {
    logger.debug('[COMPONENTS BASE] replace', name, ComponentClass);
    if (!this[`_${name}`]) {
      Object.defineProperty(this, name, {
        enumerable: true,
        configurable: true,
        // writable: true,
        set(CClass) {
          this[`_${name}`] = CClass;
        },
        get() {
          const CClass = this[`_${name}`];
          // отложенная загрузка компонентов () => require('./Component);
          return executeVariableMemoize(name, CClass);
        },
      });
    }
    this[name] = ComponentClass;
    return this;
  },
  wrap(name, ComponentClass, funcIsClass = false) {
    const prev = this[`_${name}`];
    logger.debug('[COMPONENTS BASE] wrap', name, ComponentClass, prev);
    if (!prev) {
      this.replace(name, ComponentClass);
    } else {
      this.replace(name, () => (props) => React.createElement(
        funcIsClass
          ? ComponentClass
          : executeVariable(ComponentClass),
        props,
        React.createElement(prev, props),
      ));
    }
    return this;
  },
  addClassName(name, className) {
    logger.debug('[COMPONENTS BASE] addClassName', name, className);
    const prev = this[`_${name}`];
    if (prev) {
      this.replace(name, () => (props) => React.createElement(
        prev,
        {
          ...props,
          className: `${className} ${props.className || ''}`,
        },
      ));
    }
    return this;
  },
};

// ======================================================
// FORM UI
// ======================================================
COMPONENTS_BASE.replace('Form', () => require('./form/CoreForm').default);
COMPONENTS_BASE.replace('FormLayout', () => require('./form/FormLayout').default);
COMPONENTS_BASE.replace('Field', () => require('./form/CoreField').default);
COMPONENTS_BASE.replace('FieldLayout', () => require('./form/FieldLayout').default);
COMPONENTS_BASE.replace('Form', () => require('./form/CoreForm').default);
COMPONENTS_BASE.replace('Form', () => require('./form/CoreForm').default);

// ======================================================
// FORM FIELDS
// ======================================================
COMPONENTS_BASE.replace('BaseInput', () => (props) => <input { ...props } />);
COMPONENTS_BASE.replace('BaseNumberInput', () => (props) => <input { ...props } type="number" />);
COMPONENTS_BASE.replace('Input', () => require('./form/fields/CoreInput').default);
COMPONENTS_BASE.replace('BaseTextArea', () => (props) => <textarea { ...props } />);
COMPONENTS_BASE.replace('TextArea', () => require('./form/fields/CoreTextArea').default);
COMPONENTS_BASE.replace('BaseSelect', () => (props) => <select { ...props } />);
COMPONENTS_BASE.replace('Select', () => require('./form/fields/CoreSelect').default);
COMPONENTS_BASE.replace('DatePicker', () => null);
COMPONENTS_BASE.replace('Checkbox', () => (props) => <input { ...props } type="checkbox" />);

// ======================================================
// UI
// ======================================================
COMPONENTS_BASE.replace('Loading', () => require('./Loading/Loading').default);
COMPONENTS_BASE.replace('Button', () => (props) => (<button { ...props } />));
COMPONENTS_BASE.replace('Link', () => require('./Link/Link').default);
COMPONENTS_BASE.replace('ActionStatus', () => require('./ActionStatus/ActionStatus').default);
COMPONENTS_BASE.replace('Notifications', () => require('./Notifications/Notifications').default);
COMPONENTS_BASE.replace('Notice', () => require('./Notifications/Notice').default);
COMPONENTS_BASE.replace('Modal', () => null);
COMPONENTS_BASE.replace('Info404', () => require('./Info404/Info404').default);

export default COMPONENTS_BASE;
