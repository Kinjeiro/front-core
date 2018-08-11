// todo @ANKU @LOW - @toCore
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import bind from 'lodash-decorators/bind';

import logger from '../../helpers/client-logger';
import clientConfig from '../../client-config';
import i18n from '../../utils/i18n-utils';

import getComponents from '../../get-components';

const {
  Segment,
  Button,
} = getComponents();

export default class ErrorBoundary extends PureComponent {
  static propTypes = {
    children: PropTypes.any,
    hasError: PropTypes.bool,
  };

  state = {
    hasError: this.props.hasError || false,
  };

  componentDidCatch(error, info) {
    this.setState({ hasError: true });
    logger.error(error, info);
  }

  // ======================================================
  // HANDLERS
  // ======================================================
  @bind()
  handleUpdate() {
    this.setState({
      hasError: false,
    });
    this.forceUpdate();
  }

  render() {
    const {
      children,
    } = this.props;
    if (this.state.hasError) {
      return (
        <Segment
          label={ i18n('core:components.ErrorBoundary.header') }
        >
          { !clientConfig.common.isProduction && (
            <Button onClick={ this.handleUpdate }>
              { i18n('core:components.ErrorBoundary.refreshButton') }
            </Button>
          ) }
        </Segment>
      );
    }
    return children;
  }
}
