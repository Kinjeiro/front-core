import React from 'react';
import PropTypes from 'prop-types';

import i18n from '../../utils/i18n-utils';
import bemDecorator from '../../utils/decorators/bem-component';
import appUrl from '../../helpers/app-urls';

import { PATH_INDEX } from '../../constants/routes.pathes';

@bemDecorator('Info404')
export default class Info404 extends React.Component {
  static propTypes = {
    message: PropTypes.string,
  };
  static defaultProps = {
    message: i18n('core:pages.Info404.pageNotFoundError'),
  };

  render() {
    // todo @ANKU @LOW - проверить что Link url="/" работает без contextPath
    return (
      <div>
        <b>{ this.props.message }</b>
        {/* // todo @ANKU @LOW - переделать на actionGoTo*/}
        <a href={ appUrl(PATH_INDEX) }>
          { i18n('core:pages.Info404.returnTo') }
          { i18n('core:pages.Info404.indexPage') }
        </a>
      </div>
    );
  }
}
