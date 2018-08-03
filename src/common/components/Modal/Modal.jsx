import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import bind from 'lodash-decorators/bind';

// import i18n from '../../utils/i18n';

import './Modal.css';

export default class Modal extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
  };

  render() {
    const {
      children,
    } = this.props;

    return (
      <div className="Modal">
        <div className="Modal__content">
          { children }
        </div>
      </div>
    );
  }
}
