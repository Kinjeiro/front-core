import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import bemDecorator from '../../../common/utils/decorators/bem-component';

// ======================================================
// UTILS
// ======================================================
import i18n from '../../utils/i18n-utils';

// ======================================================
// REDUX
// ======================================================
import * as reduxSelectors from '../../app-redux/selectors';
import { actions as globalUniErrorActions } from '../../app-redux/reducers/app/global-uni-error';

// ======================================================
// COMPONENTS and STYLES
// ======================================================
import { PATH_INDEX } from '../../constants/routes.pathes';
import { UNI_ERROR_PROP_TYPE } from '../../models/uni-error';
import getComponents from '../../get-components';

const {
  UniError,
} = getComponents();

@connect(
  (state) => ({
    globalUniError: reduxSelectors.getGlobalUniError(state),
  }),
  {
    ...globalUniErrorActions,
  },
)
@bemDecorator('ErrorPage')
export default class ErrorPage extends Component {
  static propTypes = {
    globalUniError: UNI_ERROR_PROP_TYPE,
    actionClearGlobalUniError: PropTypes.func,

    returnUrl: PropTypes.string,

    /*
     Проброс доп параметров через параметры route
     <Route
       path={ PATH_ACCESS_DENIED }
       component={ ErrorPage }
       showDetail={ false }
     />
    */
    // todo @ANKU @CRIT @MAIN - переделать на обычные пропсы - написав враппер
    route: PropTypes.shape({
      showDetails: UniError.propTypes.showDetails,
      defaultUniError: UniError.propTypes.uniError,
    }),
  };

  // ======================================================
  // LIFECYCLE
  // ======================================================
  // componentDidMount() {
  //  const { uniError } = this.props;
  //  logger.error(['ErrorPage'], uniError);
  // }
  // componentWillReceiveProps(newProps) {
  // }
  componentWillUnmount() {
    this.props.actionClearGlobalUniError();
  }

  // ======================================================
  // HANDLERS
  // ======================================================


  // ======================================================
  // RENDERS
  // ======================================================
  renderReturnUrl() {
    const { returnUrl } = this.props;
    return returnUrl !== false && (
      <p>
        { i18n('core:pages.ErrorPage.returnTo') }
        {
          returnUrl
          ? (
            <a href={ returnUrl }>{ returnUrl }</a>
          )
          : (
            <a href={ PATH_INDEX }>{ i18n('core:pages.ErrorPage.indexPage')}</a>
          )
        }
      </p>
    );
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      globalUniError,
      route: {
        showDetails,
        defaultUniError,
      },
    } = this.props;

    return (
      <div>
        <UniError
          uniError={ globalUniError || defaultUniError }
          showDetails={ showDetails }
        />
        { this.renderReturnUrl() }
      </div>
    );
  }
}
