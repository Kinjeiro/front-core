import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import bind from 'lodash-decorators/bind';

// import i18n from '../../utils/i18n';

import './CoreModal.css';

const ESC_KEY_CODE = 27;

export default class CoreModal extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,

    isCancelOnEsc: PropTypes.bool,

    onCancel: PropTypes.func,
  };

  static defaultProps = {
    isCancelOnEsc: true,
  };

  domContent = null;

  // ======================================================
  // UTILS
  // ======================================================
  canCancel() {
    const {
      onCancel,
    } = this.props;

    return onCancel;
  }

  // ======================================================
  // LIFECYCLE
  // ======================================================
  componentDidMount() {
    const {
      isCancelOnEsc,
    } = this.props;
    if (this.canCancel()) {
      document.addEventListener('mousedown', this.handleClickOutside);
      if (isCancelOnEsc) {
        document.addEventListener('keydown', this.handleKeyDown, false);
      }
    }
  }

  componentWillUnmount() {
    const {
      isCancelOnEsc,
    } = this.props;
    if (this.canCancel()) {
      document.removeEventListener('mousedown', this.handleClickOutside);
      if (isCancelOnEsc) {
        document.removeEventListener('keydown', this.handleKeyDown, false);
      }
    }
  }

  // ======================================================
  // HANDLERS
  // ======================================================
  @bind()
  handleClickOutside(event) {
    const {
      onCancel,
    } = this.props;
    const {
      domContent,
    } = this;

    if (this.canCancel() && domContent && !domContent.contains(event.target)) {
      onCancel();
    }
  }
  @bind()
  handleKeyDown(event) {
    const {
      onCancel,
      isCancelOnEsc,
    } = this.props;

    if (isCancelOnEsc && event.keyCode === ESC_KEY_CODE && this.canCancel()) {
      onCancel();
    }
  }

  @bind()
  handleClose(/* event */) {
    const {
      onCancel,
    } = this.props;

    onCancel();
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      className,
      children,
    } = this.props;

    return (
      <div
        className={ `CoreModal ${className || ''}` }
      >
        <div
          className="CoreModal__content"
          ref={ (domElement) => this.domContent = domElement }
        >
          { this.canCancel() && (
            <div
              className="CoreModal__closer"
              onClick={ this.handleClose }
            />
          ) }
          { children }
        </div>
      </div>
    );
  }
}
