import React, { Component } from 'react';
import PropTypes from 'prop-types';
import bind from 'lodash-decorators/bind';

import bemDecorator from '../../../../../../common/utils/decorators/bem-component';

import PROPS, { defaultProps } from './notice-props';

// todo @ANKU @LOW - в отдельную фичу оформить
@bemDecorator({ componentName: 'Notice', wrapper: false })
export default class Notice extends Component {
  static propTypes = PROPS;
  static defaultProps = defaultProps;

  // ======================================================
  // HANDLERS
  // ======================================================
  // onApplyWithClose = () => {
  //  if (this.props.onApply) {
  //    this.props.onApply();
  //  }
  //  this.closeNotice();
  // };
  //
  // onCancelWithClose = () => {
  //  if (this.props.onCancel) {
  //    this.props.onCancel();
  //  }
  //  this.closeNotice();
  // };
  @bind()
  handleNotificationCloseTimeout() {
    this.closeNotice();
  }

  @bind()
  handleNotificationCloserClick() {
    this.closeNotice();
  }

  // ======================================================
  // UTILS
  // ======================================================
  closeNotice() {
    // event.preventDefault();
    // event.stopPropagation();
    this.props.onClose(this.props.id);
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      title,
      messages,
      status,
      // icon,
      autoCloseDelay,
    } = this.props;

    // // ошибки не должны автоматически скрываться, только по нажатию на крестик
    // const onCloseTimeout = autoCloseDelay >= 0 || status !== STATUSES.ERROR
    //   ? this.handleNotificationCloseTimeout
    //   : null;

    // autoCloseDelay={ autoCloseDelay }
    // stickTo="right"
    // icon={ icon }
    // onCloseTimeout={ onCloseTimeout }

    return (
      <div className={ this.fullClassName }>
        { title && (
          <div className={ this.bem('title') }>{ title }</div>
        ) }
        { messages && messages.map((message, index) => (
          <div
            key={ index }
            className={ this.bem('message') }
          >
            { message }
          </div>
        )) }
        <button
          className={ this.bem('closer') }
          onClick={ this.handleNotificationCloserClick }
        >
          [x]
        </button>
      </div>
    );
  }
}
