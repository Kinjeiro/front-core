/* eslint-disable jsx-a11y/img-has-alt */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

export default class Image extends PureComponent {
  static propTypes = {
    // className: PropTypes.string,
  };

  render() {
    return (
      <img
        { ...this.props }
      />
    );
  }
}
