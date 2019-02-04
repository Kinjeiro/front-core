import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import bind from 'lodash-decorators/bind';

import { emitProcessing, wrapToArray } from '../../../../../../common/utils/common';

// ======================================================
// MODULE
// ======================================================
import getComponents from '../../get-components';

import PROPS from './button-props';

const {
  ButtonView,
} = getComponents();

require('./Button.css');

export default class Button extends PureComponent {
  static propTypes = PROPS;

  static defaultProps = {
    type: 'button',
    asyncIsLoading: true,
  };

  state = {
    isProcessing: undefined,
  };

  // ======================================================
  // HANDLERS
  // ======================================================
  @bind()
  handleClick(...args) {
    const {
      onClick,
      onClickArgs,
      asyncIsLoading,
    } = this.props;

    if (onClick) {
      if (asyncIsLoading) {
        return emitProcessing(
          onClick(
            ...wrapToArray(onClickArgs),
            ...args,
          ),
          this,
          'isProcessing',
        );
      }
      return onClick(...args);
    }
    return true;
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      className,
      simple,
      primary,
      loading,
      disabled,
      asyncIsLoading,

      ...otherProps
    } = this.props;
    const {
      isProcessing,
    } = this.state;

    const isLoading = typeof loading !== 'undefined'
      ? typeof loading === 'object' && loading !== null && typeof loading.isFetching !== 'undefined'
        ? loading.isFetching
        : loading
      : asyncIsLoading
        ? isProcessing
        : undefined;

    const classNameFinal = `Button ${className || ''} ${simple ? 'Button--simple' : ''} ${primary ? 'Button--primary' : ''} ${isLoading ? 'Button--loading' : ''}`;

    return (
      <ButtonView
        { ...{
          ...this.props,
          loading: isLoading,
          disabled: isLoading || disabled,
          className: classNameFinal,
          onClick: this.handleClick,
        } }
      />
    );
  }
}
