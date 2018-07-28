import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import bind from 'lodash-decorators/bind';

// import i18n from '../../utils/i18n';

// import './AuthLayout.scss';

@connect(
  (globalState) => ({
  }),
)
export default class AuthLayout extends Component {
  static propTypes = {
    children: PropTypes.node,
  };

  static defaultProps = {
  };

  // ======================================================
  // LIFECYCLE
  // ======================================================
  // componentWllMount() {
  // }
  // componentDidMount() {
  // }
  // componentWillReceiveProps(newProps) {
  // }


  // ======================================================
  // HANDLERS
  // ======================================================
  // @bind()

  // ======================================================
  // RENDERS
  // ======================================================


  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      children,
    } = this.props;

    return (
      <div className="AuthLayout">
        { children }
      </div>
    );
  }
}
