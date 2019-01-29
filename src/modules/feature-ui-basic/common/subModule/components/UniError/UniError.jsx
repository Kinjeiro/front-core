import React, { Component } from 'react';
import PropTypes from 'prop-types';

// ======================================================
// UTILS
// ======================================================
import bemDecorator from '../../../../../../common/utils/decorators/bem-component';

import {
  UNI_ERROR_PROP_TYPE,
  createUniError,
} from '../../../../../../common/models/uni-error';

import i18n from '../../i18n';

@bemDecorator('UniError')
export default class UniError extends Component {
  static propTypes = {
    // connect
    uniError: UNI_ERROR_PROP_TYPE,
    showDetails: PropTypes.bool,
  };

  getDefaultProps() {
    return {
      uniError: createUniError(),
    };
  }

  render() {
    const {
      uniError,
      showDetails,
    } = this.props;

    return (
      <div>
        {
          uniError
            ? uniError.uniMessage
            : i18n('components.UniError.errorOccurred')
        }

        {
          uniError && showDetails && (
            <div>
              <p>{ i18n('components.UniError.showDetails') }:</p>

              <pre>
                <code>
                  { JSON.stringify(uniError, undefined, 2) }
                </code>
              </pre>
            </div>
          )
        }
      </div>
    );
  }
}
