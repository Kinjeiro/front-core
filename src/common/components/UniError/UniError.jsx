import React, { Component } from 'react';
import PropTypes from 'prop-types';

// ======================================================
// UTILS
// ======================================================
import bemDecorator from '../../utils/decorators/bem-component';
import i18n from '../../utils/i18n-utils';

import {
  UNI_ERROR_PROP_TYPE,
  createUniError,
} from '../../models/uni-error';

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
            : i18n('core:components.UniError.errorOccurred')
        }

        {
          uniError && showDetails && (
            <div>
              <p>{ i18n('core:components.UniError.showDetails') }:</p>

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
