import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
// import bind from 'lodash-decorators/bind';

import i18n from '../../utils/i18n-utils';
import bemDecorator from '../../utils/decorators/bem-component';
import PROP_ACTION_STATUS from '../../models/model-action-status';

// import './ActionStatus.scss';

@bemDecorator({ componentName: 'ActionStatus', wrapper: false })
export default class ActionStatus extends PureComponent {
  static propTypes = {
    actionStatus: PROP_ACTION_STATUS,
    children: PropTypes.node,
    textSuccess: PropTypes.node,
    showError: PropTypes.bool,
  };

  static defaultProps = {
    showError: true,
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
      actionStatus: {
        isFetching,
        isLoaded,
        isFailed,
        error,
      },
      children,
      textSuccess,
      showError,
    } = this.props;

    let component = !isFetching && isFailed && showError && (
      <div className={ this.bem('error') }>
        {
          error
            ? error.isNotFound
              ? i18n('core:errors.authServerNotResponse')
              : error.uniMessage
            : i18n('core:error:clientErrorMessageDefault')
        }
      </div>
    );

    if (children) {
      component = (
        <React.Fragment>
          {
            textSuccess && !isFetching && isLoaded
            ? (
              <div className={ this.bem('successText') }>
                { textSuccess }
              </div>
            )
            : children
          }
          {
            component
          }
        </React.Fragment>
      );
    }

    return component && (
      <div className={ `${this.fullClassName} ${this.bem({ isSuccess: isLoaded, isFailed })}` }>
        {
          component
        }
      </div>
    );
  }
}

