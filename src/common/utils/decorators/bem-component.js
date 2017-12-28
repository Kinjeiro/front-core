/* eslint-disable no-param-reassign */
import React from 'react';
import PropTypes from 'prop-types';

import bemBlock from '../bem';

// /* camelcase to hyphens*/
// function camelCaseToDash(str) {
//   return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
// }

export function addClassName(currentClassName, ...newClassNames) {
  const resultClasses = newClassNames.reduce((resultArray, newClassName) => {
    if (newClassName && resultArray.indexOf(newClassName) < 0) {
      resultArray.push(newClassName);
    }
    return resultArray;
  }, currentClassName ? currentClassName.split(' ') : [])
    .join(' ');

  return resultClasses !== currentClassName
    ? resultClasses
    : currentClassName;
}

function getTheme(instance) {
  return instance.props.theme || instance.context.theme;
}

/*
 * интегрирует в компонент переменные
 * bem - инстантс от https://github.com/albburtsev/bem-cn
 * fullClassName - css классы bem + theme
 *
 * так же добавляет модификатор theme (из contextTypes)
 * options - string (componentName) \\ object {
     componentName,
     wrapper = true,
     theme = true,
 * }
*/
function bemDecorator(options) {
  let finalOptions = options || {};
  if (typeof finalOptions === 'string') {
    finalOptions = {
      componentName: finalOptions,
    };
  }
  const {
    componentName,
    wrapper = true,
    theme = true,
  } = finalOptions;

  return (targetClass) => {
    // todo @ANKU @LOW - при минификации во время прода имя класса меняется (targetClass.name) - либо использовать
    /*
     new UglifyJsPlugin({
       mangle: {
        keep_fnames: true
       }
     }),
     либо https://github.com/babel/minify/tree/master/packages/babel-plugin-minify-mangle-names#options
    */
    // const classBem = bemBlock(componentName || targetClass.name);
    const classBem = bemBlock(componentName);
    // targetClass.prototype.bem = bemBlock(componentName || camelCaseToDash(targetClass.name));
    targetClass.prototype.bem = (...args) => {
      const result = classBem(...args);
      return typeof result === 'function'
        // убираем оборачивание в функцию, чтобы сразу на выходе была стринга (нам объект-функция для расширения не нужен)
        // многие компоненты с className не расчитывают на объект-функцию
        ? result()
        : result;
    };

    // так как bem - это функция для создания других classNames, то для блока нужна вызвать с пустыи парпаметром
    targetClass.prototype.fullClassName = null;

    if (targetClass.prototype.render) {
      targetClass.contextTypes = {
        ...targetClass.contextTypes,
        theme: PropTypes.string,
      };

      const originalRender = targetClass.prototype.render;
      targetClass.prototype.render = function renderWrapper() {
        const targetInstance = this;

        let fullClassName = targetInstance.props.className;
        if (theme) {
          fullClassName = addClassName(
            fullClassName,
            targetInstance.bem({ theme: getTheme(targetInstance) }),
          );
        }
        targetInstance.fullClassName = fullClassName;

        let result = originalRender.call(targetInstance);

        if (wrapper) {
          result = React.createElement(
            wrapper === true ? 'div' : wrapper,
            {
              className: fullClassName,
            },
            result,
          );
        }
        return result;
      };
    }
  };
}

export default bemDecorator;
