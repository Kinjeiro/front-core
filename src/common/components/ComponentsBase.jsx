/* eslint-disable global-require,max-len */
import React from 'react';

import {
  executeVariable,
  executeVariableMemoize,
} from '../utils/common';
import logger from '../helpers/client-logger';
import clientConfig from '../client-config';

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
          return clientConfig.common.isProduction
            ? executeVariableMemoize(name, CClass)
            : executeVariable(CClass);
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
        React.createElement(executeVariable(prev), props),
      ));
    }
    return this;
  },
  addClassName(name, className) {
    logger.debug('[COMPONENTS BASE] addClassName', name, className);
    const prev = this[`_${name}`];
    if (prev) {
      this.replace(name, () => (props) => React.createElement(
        executeVariable(prev),
        {
          ...props,
          className: `${executeVariable(className)} ${props.className || ''}`,
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

// ======================================================
// FORM FIELDS
// ======================================================
COMPONENTS_BASE.replace('BaseInput', () => ({ controlRef, touched, ...props }) => <input ref={ controlRef } { ...props } />);
COMPONENTS_BASE.replace('BaseNumberInput', () => ({ controlRef, touched, ...props }) => <input ref={ controlRef } { ...props } type="number" />);
COMPONENTS_BASE.replace('Input', () => require('./form/fields/CoreInput').default);
COMPONENTS_BASE.replace('BaseTextArea', () => ({ controlRef, touched, ...props }) => <textarea ref={ controlRef } { ...props } />);
COMPONENTS_BASE.replace('TextArea', () => require('./form/fields/CoreTextArea').default);
COMPONENTS_BASE.replace('BaseSelect', () => (props) => <select { ...props } />);
COMPONENTS_BASE.replace('Select', () => require('./form/fields/CoreSelect').default);
COMPONENTS_BASE.replace('DatePicker', () => ({ controlRef, touched, ...props }) => <input ref={ controlRef } { ...props } />);
COMPONENTS_BASE.replace('Checkbox', () => ({ controlRef, touched, ...props }) => <input ref={ controlRef } { ...props } type="checkbox" />);

// ======================================================
// UI
// ======================================================
COMPONENTS_BASE.replace('Loading', () => require('./Loading/Loading').default);
COMPONENTS_BASE.replace('Button', () => (props) => (<button { ...props } />));
COMPONENTS_BASE.replace('Link', () => require('./Link/Link').default);
COMPONENTS_BASE.replace('ActionStatus', () => require('./ActionStatus/ActionStatus').default);
COMPONENTS_BASE.replace('Notifications', () => require('./Notifications/Notifications').default);
COMPONENTS_BASE.replace('Notice', () => require('./Notifications/Notice').default);
COMPONENTS_BASE.replace('Modal', () => require('./Modal/Modal').default);
COMPONENTS_BASE.replace('Segment', () => ({ children }) => (<div>{ children }</div>));

// ======================================================
// PAGES
// ======================================================
COMPONENTS_BASE.replace('Info404', () => require('./Info404/Info404').default);

export default COMPONENTS_BASE;
