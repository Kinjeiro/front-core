import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
// import bind from 'lodash-decorators/bind';

import bemDecorator from '../../../../../../common/utils/decorators/bem-component';
import PROP_ACTION_STATUS from '../../../../../../common/models/model-action-status';


import i18n from '../../i18n';
// import './ActionStatus.scss';

@bemDecorator({ componentName: 'ActionStatus', wrapper: false })
export default class ActionStatus extends PureComponent {
  static propTypes = {
    actionStatus: PROP_ACTION_STATUS,
    children: PropTypes.node,
    textSuccess: PropTypes.node,
    showError: PropTypes.bool,
    replaceForm: PropTypes.bool,
  };

  static defaultProps = {
    replaceForm: true,
    showError: true,
  };

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
      replaceForm,
    } = this.props;

    const errorComponent = showError && !isFetching && isFailed && (
      <div className={ this.bem('error') }>
        {
          error
            ? error.isNotFound
              ? i18n('errors.authServerNotResponse')
              : error.uniMessage
            : i18n('error:clientErrorMessageDefault')
        }
      </div>
    );
    const successComponent = textSuccess && isLoaded && !isFetching && !isFailed && (
      <div className={ this.bem('successText') }>
        { textSuccess }
      </div>
    );

    return (
      <div className={ `${this.fullClassName} ${this.bem({ isSuccess: isLoaded, isFailed })}` }>
        { replaceForm ? null : children }
        { errorComponent }
        { successComponent }
      </div>
    );
  }
}

