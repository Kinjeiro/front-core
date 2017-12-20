import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { I18nextProvider } from 'react-i18next';

// ======================================================
// REDUX
// ======================================================
import { getI18NInfo } from '../../app-redux/selectors';
import { actions } from '../../app-redux/reducers/app/i18n-info';

// ======================================================
// COMPONENTS and STYLES
// ======================================================
@connect(
  (state) => ({
    i18nInfo: getI18NInfo(state),
  }),
  {
    actionI18nInfoInit: actions.actionI18nInfoInit,
  },
)
export default class I18NProvider extends Component {
  static propTypes = {
    // ======================================================
    // PROPS
    // ======================================================
    i18nInstance: PropTypes.object.isRequired,

    // ======================================================
    // CONNECT
    // ======================================================
    i18nInfo: PropTypes.shape({
      language: PropTypes.string,
      whitelist: PropTypes.arrayOf(PropTypes.string),
    }),

    actionI18nInfoInit: PropTypes.func,
  };

  // ======================================================
  // LIFECYCLE
  // ======================================================
  componentWillMount() {
    const {
      i18nInstance: {
        language,
        options: {
          whitelist,
        },
      },
      actionI18nInfoInit,
    } = this.props;

    actionI18nInfoInit(
      // todo @ANKU @LOW @BUG_OUT @i18next - cimode зачему-то добавляется
      whitelist.filter((key) => key !== 'cimode'),
      language,
    );
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      i18nInstance,
      i18nInfo: {
        language,
      },
      children,
    } = this.props;

    /*
       @guide - если ключ key отличается, то происходит заново unmount и mount компонентов
       Это то, что нужно при изменении локализации, так как многие используют i18n
       - в дефолтных пропертях (только нужно метод getDefaultProps а не статика)
       - в componentWillMount
    */
    return language && (
      <I18nextProvider
        i18n={ i18nInstance }
        key={ language }
      >
        { children }
      </I18nextProvider>
    );
  }
}
