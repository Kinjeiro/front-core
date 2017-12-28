import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

// ======================================================
// UTILS
// ======================================================
import bemDecorator from '../../utils/decorators/bem-component';
import loading from '../../utils/decorators/react-class/loading';
import titled from '../../utils/decorators/react-class/titled';
import i18n, { changeLanguagePromise } from '../../utils/i18n-utils';
import appUrl from '../../helpers/app-urls';

import { notifyError } from '../../helpers/notifications';

// ======================================================
// REDUX
// ======================================================
import apiUser from '../../api/api-user';

import {
  getI18NInfo,
  getUserInfo,
  hasPermission,
  getTestDomains,
} from '../../app-redux/selectors';
import * as reduxI18nInfo from '../../app-redux/reducers/app/i18n-info';
import * as reduxUserInfo from '../../app-redux/reducers/app/user-info';

import TestDomain from '../../models/domains/TestDomain';

// ======================================================
// COMPONENTS and STYLES
// ======================================================
import { TEST_PERMISSION } from '../../constants/permissions';
import { USER_INFO_PROPS } from '../../models';
import { ListItem } from '../../components';

import './StubPage.css';

@titled(
  'stubPage',
  i18n('core:pages.StubPage.title'),
  {
    description: i18n('core:pages.StubPage.description'),
  },
)
// todo @ANKU @CRIT @MAIN - вынести все это в examples
@connect(
  (state) => {
    const userInfo = getUserInfo(state);

    return {
      i18nInfo: getI18NInfo(state),
      userInfo,
      // @debug - так как мы используем mock, то реальный пользователь с загрузкой страницы не приходит, так как мы токен не используем, поэтому нужно проверить загрузился ли он через componentWillMount
      showTestPermission: userInfo.username && hasPermission(state, TEST_PERMISSION),
      testDomains: getTestDomains(state),
    };
  },
  {
    ...reduxI18nInfo.getBindActions({
      apiI18NChangeLanguage: changeLanguagePromise,
    }),
    ...reduxUserInfo.getBindActions({
      apiChangeUser: apiUser.apiLogin,
    }),
    ...TestDomain.getActions(),
    actionGoto: push,
  },
)
@bemDecorator({ componentName: 'StubPage', wrapper: false })
@loading((thisContext) => thisContext.state.isLoading)
export default class StubPage extends Component {
  static propTypes = {
    // ======================================================
    // CONNECT
    // ======================================================
    i18nInfo: PropTypes.shape({
      language: PropTypes.string,
      whitelist: PropTypes.arrayOf(PropTypes.string),
    }),
    userInfo: USER_INFO_PROPS,
    showTestPermission: PropTypes.bool,

    actionI18NChangeLanguage: PropTypes.func,
    actionChangeUser: PropTypes.func,

    testDomains: PropTypes.arrayOf(TestDomain.propTypes),
    actionCreateTestDomain: PropTypes.func,
    actionUpdateTestDomain: PropTypes.func,
    actionDeleteTestDomain: PropTypes.func,
    actionGoto: PropTypes.func,
  };

  state = {
    isLoading: true,
  };

  // ======================================================
  // LIFECYCLE
  // ======================================================
  componentDidMount() {
    setTimeout(() => {
      notifyError(i18n('core:pages.StubPage.testErrorNotification'));
    }, 4000);

    setTimeout(() => {
      this.setState({
        isLoading: false,
      });
    }, 2000);
  }

  // ======================================================
  // HANDLERS
  // ======================================================
  @autobind
  handleChangeUser() {
    this.props.actionChangeUser(
      this.props.userInfo.username === 'ivanovI'
        ? 'korolevaU'
        : 'ivanovI',
      '123456',
    );
  }

  @autobind
  handleClickCreateTestDomain() {
    this.props.actionCreateTestDomain({ value: Math.random() });
  }
  @autobind
  handleClickItemTestDomain(id) {
    this.props.actionUpdateTestDomain(id, { value: Math.random() });
  }
  @autobind
  handleClickRemoveTestDomain(id) {
    this.props.actionDeleteTestDomain(id);
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      i18nInfo: {
        language,
        whitelist,
      },
      userInfo: {
        username,
        profileImageURI,
      },
      testDomains,
      showTestPermission,
      actionI18NChangeLanguage,
      actionGoto,
    } = this.props;


    /*
      @guide - fullClassName проставляется в декораторе бэма (@bemDecorator)
      Так как мы не используем враппер, то должны сами позаботится об этом
    */
    return (
      <div className={ this.fullClassName }>
        { i18n('core:pages.StubPage.pageTitle') }

        <button onClick={ () => actionGoto(appUrl()) }>
          { i18n('core:go to index') }
        </button>

        <div className={ this.bem('languageElement', { lang: language }) }>
          <p>
            { i18n('core:pages.StubPage.languagesLabel') }:
            {
              /* это пример, биндить так не нужно, нужно выносить в отдельный компонент */
              whitelist.map((key) => (
                <ListItem
                  key={ key }
                  disabled={ key === language }
                  value={ key }
                  onClick={ actionI18NChangeLanguage }
                >
                  {i18n(`core:languages.${key}`)} |
                </ListItem>
              ))
            }
          </p>

          <div className={ this.bem('title') }>
            { i18n('core:app.title') }
          </div>
        </div>

        <div>
          <div>
            <p>{ i18n('core:pages.StubPage.currentUserTitle') }:</p>
            {
              profileImageURI && (
                <div>
                  <img
                    src={ profileImageURI }
                    alt={ username }
                  />
                </div>
              )
            }
            <p>{ username }</p>
          </div>

          {
            showTestPermission && (
              <div>TEST_PERMISSION</div>
            )
          }

          <button onClick={ this.handleChangeUser }>
            { i18n('core:pages.StubPage.changeUserButton') }
          </button>
        </div>

        <div>
          <h3>{ i18n('core:pages.StubPage.domainTitle') }</h3>
          <button onClick={ this.handleClickCreateTestDomain }>
            {i18n('core:pages.StubPage.createTestDomainButton')}
          </button>
          <ul>
            { testDomains.map((testDomain) => (
              <ListItem
                key={ testDomain.id }
                onClick={ this.handleClickItemTestDomain }
                value={ testDomain.id }
              >
                { testDomain.value }
                <ListItem
                  tag="span"
                  value={ testDomain.id }
                  onClick={ this.handleClickRemoveTestDomain }
                >
                  _[x]_
                </ListItem>
              </ListItem>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}
