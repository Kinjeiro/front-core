import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import bind from 'lodash-decorators/bind';

import Link from '../../components/Link/Link';
import { PATH_STUB } from '../../routes.pathes';
// import './TestPage.scss';

@connect(
  (globalState) => ({
  }),
)
export default class TestPage extends Component {
  static propTypes = {
  };

  static defaultProps = {
  };

  // ======================================================
  // LIFECYCLE
  // ======================================================
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

    } = this.props;

    return (
      <div className="TestPage">
        testtest

        <Link to={ PATH_STUB }>
          STUB PAGE (test routing)
        </Link>
      </div>
    );
  }
}
