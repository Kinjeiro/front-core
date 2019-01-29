import React, { Component } from 'react';
import PropTypes from 'prop-types';
import bind from 'lodash-decorators/bind';

import bemDecorator from '../../../../../../common/utils/decorators/bem-component';

import './ListItem.css';

/**
 * Компонент для того, чтобы не писать bind функции c ключом
 * В основном используется, чтобы улучшить производительность - не биндить фунции внутри render каждый раз при перерисовки (а она оооочень частая)
 * См. https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-no-bind.md#lists-of-items
 */
@bemDecorator({ componentName: 'ListItem', wrapper: false })
export default class ListItem extends Component {
  static propTypes = {
    value: PropTypes.any,
    label: PropTypes.node, // or use 'children'

    tag: PropTypes.string,
    children: PropTypes.node,
    className: PropTypes.string,

    stopPropagation: PropTypes.bool,
    onClick: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseOut: PropTypes.func,
    handlerContext: PropTypes.any,

    // ...other - остальные сво-ва проксируются в компонент
  };

  static defaultProps = {
    tag: 'li',
    stopPropagation: true,
  };


  callHandler(handlerMethod, event) {
    const {
      handlerContext,
      value,
      stopPropagation,
    } = this.props;

    this.props[handlerMethod].call(handlerContext || null, value);

    if (stopPropagation) {
      event.stopPropagation();
    }
  }

  // ======================================================
  // HANDLERS
  // ======================================================
  /*
  @guide - @bind() (так как это бинд быстрее работает, нежели анонимная функция с кложером, которая используется
  в стрелочных функциях типа handleClick = () => {}
  Причем такой бинд создается только при использовании, если нет использования - нагрузки не будет
  Если компонент будет часто переиспользоваться, это важно, если нет можно на удобных стрелочных делать
  */
  @bind()
  handleClick(event) {
    this.callHandler('onClick', event);
  }
  @bind()
  handleMouseOut(event) {
    this.callHandler('onMouseOut', event);
  }
  @bind()
  handleMouseOver(event) {
    this.callHandler('onMouseOver', event);
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      tag,
      label,
      value,
      onClick,
      onMouseOut,
      onMouseOver,
      children,
      className = '',
      stopPropagation, // просто чтобы убрать и не попало
      ...other
    } = this.props;

    const finalChildren = children || label || value;

    return React.createElement(tag, {
      className: `${this.fullClassName} ${className}`,
      onClick: onClick ? this.handleClick : undefined,
      onMouseOut: onMouseOut ? this.handleMouseOut : undefined,
      onMouseOver: onMouseOver ? this.handleMouseOver : undefined,
      ...other,
    }, finalChildren);
  }
}
