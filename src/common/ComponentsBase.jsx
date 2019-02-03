/* eslint-disable global-require,max-len,react/prop-types */
import React from 'react';

import clientConfig from './client-config';
import {
  executeVariable,
  executeVariableMemoize,
  generateId,
} from './utils/common';
import logger from './helpers/client-logger';

function wrap(ComponentClass, PrevClassWrapper, funcIsClass = false) {
  const prevClassId = generateId();
  return () => {
    if (!PrevClassWrapper) {
      return ComponentClass;
    }
    // нужно сначала его загрузить, чтобы сначала css их пременился, а потом css остальных
    const PrevClass = executeVariableMemoize(prevClassId, PrevClassWrapper);
    const ComponentClassFinal = funcIsClass ? ComponentClass : executeVariable(ComponentClass, null, PrevClass);

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
    const classNameFinal = executeVariable(classNameAdditional, null, CurrentClass);

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
    // сначала загружаются стили и импорты родительского компонента
    const CurrentClass = executeVariableMemoize(currentClassId, CurrentClassWrapper);
    // а только потом вызывается колбек наш где грузится проектный css
    executeVariable(callback, null, CurrentClass);
    return CurrentClass;
  };
}

export function createComponentBase() {
  return {
    replace(name, ComponentClass, withPrevious = false, notLog = false) {
      const ccFieldInner = `_${name}`;
      const ccFieldInnerPrev = `${ccFieldInner}_prev`;
      const ccField = name;
      const ccFieldWithPrevious = `${ccFieldInner}_withPrevious`;

      // если хотя бы один компонент из одинакового найминга - то будет true
      this[ccFieldWithPrevious] = this[ccFieldWithPrevious] || withPrevious;

      if (!notLog && clientConfig.common.features.componentsBase.logComponentBaseEvents) {
        logger.debug('[COMPONENTS BASE] replace', name, ComponentClass, withPrevious);
      }
      if (!this[ccFieldInner]) {
        Object.defineProperty(this, ccField, {
          enumerable: true,
          configurable: true,
          // writable: true,
          set(CClass) {
            this[ccFieldInnerPrev] = this[ccFieldInner];
            this[ccFieldInner] = CClass;
          },
          get() {
            const CClass = this[ccFieldInner];
            const withPreviousFinal = this[ccFieldWithPrevious];
            const PrevCClass = this[ccFieldInnerPrev];
            // отложенная загрузка компонентов () => require('./Component);
            const ComponentClassFinal = executeVariable(
              CClass,
              null,
              // todo @ANKU @LOW - не поддерживается 1) ClassA 2) (ClassA) => ClassB 3) (ClassB) => ClassC
              //  тут ограничение, что если предыдущий объект тоже функция зависящая от предыдущего то будет ошибка
              withPreviousFinal ? executeVariable(PrevCClass) : undefined,
            );
            if (!ComponentClassFinal) {
              // можно на те которые не добавлены, но запращиваются - использовать new Proxy :: get(target, key) - https://stackoverflow.com/a/36111309/344172
              logger.error(`Empty component class "${name}"`);
            }
            return ComponentClassFinal;
          },
        });
      }
      this[ccField] = ComponentClass;
      return this;
    },
    wrap(name, ComponentClass, funcIsClass = false) {
      const PrevClassWrapper = this[`_${name}`];
      if (clientConfig.common.features.componentsBase.logComponentBaseEvents) {
        logger.debug('[COMPONENTS BASE] wrap', name, !!PrevClassWrapper, ComponentClass, PrevClassWrapper);
      }
      this.replace(
        name,
        wrap(ComponentClass, PrevClassWrapper, funcIsClass),
        false,
        false,
      );
      return this;
    },
    addClassName(name, classNameAdditional) {
      const CurrentClassWrapper = this[`_${name}`];
      if (clientConfig.common.features.componentsBase.logComponentBaseEvents) {
        logger.debug('[COMPONENTS BASE] addClassName', name, !!CurrentClassWrapper, classNameAdditional);
      }
      this.replace(
        name,
        addClassName(CurrentClassWrapper, classNameAdditional),
        false,
        false,
      );
      return this;
    },
    addInitCallback(name, initCallback) {
      const CurrentClassWrapper = this[`_${name}`];
      if (clientConfig.common.features.componentsBase.logComponentBaseEvents) {
        logger.debug('[COMPONENTS BASE] addInitCallback', name, !!CurrentClassWrapper, initCallback);
      }
      this.replace(
        name,
        addCallback(CurrentClassWrapper, initCallback),
        false,
        false,
      );
      return this;
    },
  };
}

/*
 // todo @ANKU @LOW - Бага в том, что чтобы загрузить компонент нужно
 1) заимпортить getComponents
 2) потом обычно идет импорт css
 3) в const { MyComponent } = getComponents(); происходит первая загрузка родительского компонента и соотвественно css

 Получается что css родителя загружается после css ребенка!

 Workaround - для ребенка использовать require('child.css') после 3)

 */
const COMPONENTS_BASE = createComponentBase();

export default COMPONENTS_BASE;
