/* eslint-disable global-require,max-len */
import React from 'react';

import {
  executeVariable,
  executeVariableMemoize,
  generateId,
} from '../utils/common';
import logger from '../helpers/client-logger';

function wrap(ComponentClass, PrevClassWrapper, funcIsClass = false) {
  const prevClassId = generateId();
  return () => {
    if (!PrevClassWrapper) {
      return ComponentClass;
    }
    // нужно сначала его загрузить, чтобы сначала css их пременился, а потом css остальных
    const PrevClass = executeVariableMemoize(prevClassId, PrevClassWrapper);
    const ComponentClassFinal = funcIsClass ? ComponentClass : executeVariable(ComponentClass);

    // render
    return ({ children, ...otherProps }) => {
      return React.createElement(
        ComponentClassFinal,
        otherProps,
        React.createElement(PrevClass, otherProps, children),
      );
    };
  };
}

function addClassName(CurrentClassWrapper, classNameAdditional) {
  const currentClassId = generateId();
  return () => {
    const CurrentClass = executeVariableMemoize(currentClassId, CurrentClassWrapper);
    const classNameFinal = executeVariable(classNameAdditional);

    // render
    return ({ className, children, ...otherProps }) =>
      React.createElement(
        CurrentClass,
        {
          ...otherProps,
          className: `${classNameFinal || ''} ${className || ''}`,
        },
        children,
      );
  };
}

function addCallback(CurrentClassWrapper, callback) {
  const currentClassId = generateId();
  return () => {
    const CurrentClass = executeVariableMemoize(currentClassId, CurrentClassWrapper);
    executeVariable(callback);
    return CurrentClass;
  };
}

const COMPONENTS_BASE = {
  replace(name, ComponentClass) {
    logger.debug('[COMPONENTS BASE] replace', name);
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
          return executeVariable(CClass);
        },
      });
    }
    this[name] = ComponentClass;
    return this;
  },
  wrap(name, ComponentClass, funcIsClass = false) {
    const PrevClassWrapper = this[`_${name}`];
    logger.debug('[COMPONENTS BASE] wrap', name, !!PrevClassWrapper);
    this.replace(
      name,
      wrap(ComponentClass, PrevClassWrapper, funcIsClass),
    );
    return this;
  },
  addClassName(name, classNameAdditional) {
    const CurrentClassWrapper = this[`_${name}`];
    logger.debug('[COMPONENTS BASE] addClassName', name, !!CurrentClassWrapper);
    this.replace(
      name,
      addClassName(CurrentClassWrapper, classNameAdditional),
    );
    return this;
  },
  addInitCallback(name, initCallback) {
    const CurrentClassWrapper = this[`_${name}`];
    logger.debug('[COMPONENTS BASE] addInitCallback', name, !!CurrentClassWrapper);
    this.replace(
      name,
      addCallback(CurrentClassWrapper, initCallback),
    );
    return this;
  },
};

export default COMPONENTS_BASE;
