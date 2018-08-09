import React, { Component } from 'react';
import PropTypes from 'prop-types';
// todo @ANKU @LOW - заменить на lodash-derocators так как там есть нормальный debouce
import bind from 'lodash-decorators/bind';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

// ======================================================
// UTILS
// ======================================================
import bemDecorator from '../../utils/decorators/bem-component';
import loading from '../../utils/decorators/react-class/loading';
import titled from '../../utils/decorators/react-class/titled';
import i18n, { changeLanguagePromise } from '../../utils/i18n-utils';
import { PATH_INDEX } from '../../routes.pathes';

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
import * as reduxTest from '../../app-redux/reducers/app/test';
import * as reduxLastUniError from '../../app-redux/reducers/app/last-uni-error';

import TestDomain from '../../models/domains/TestDomain';

// ======================================================
// COMPONENTS and STYLES
// ======================================================
import { TEST_PERMISSION } from '../../constants/permissions';
import { USER_INFO_PROPS } from '../../models';
import ListItem from '../../components/ListItem/ListItem';
import Link from '../../components/Link/Link';
import contextModules from '../../contexts/ContextModules/decorator-context-modules';
import ModuleLink from '../../containers/ModuleLink/ModuleLink';

import CB from '../../components/ComponentsBase';

import './StubPage.css';
import './StubPageSass.scss';

const {
  Segment,
  Form,
} = CB;

// const PAGE_ID = 'StubPage';

@contextModules()
@titled(
  'stubPage',
  i18n('core:pages.StubPage.title'),
  {
    description: i18n('core:pages.StubPage.description'),
  },
)
// todo @ANKU @CRIT @MAIN - вынести все это в examples
@connect(
  (globalState) => {
    const userInfo = getUserInfo(globalState);

    return {
      i18nInfo: getI18NInfo(globalState),
      userInfo,
      // @debug - так как мы используем mock, то реальный пользователь с загрузкой страницы не приходит, так как мы токен не используем, поэтому нужно проверить загрузился ли он через componentWillMount
      showTestPermission: hasPermission(globalState, TEST_PERMISSION),
      testDomains: getTestDomains(globalState),
    };
  },
  {
    ...reduxI18nInfo.getBindActions({
      apiI18NChangeLanguage: changeLanguagePromise,
    }),
    ...reduxUserInfo.getBindActions({
      apiChangeUser: apiUser.apiLogin,
      apiUserLogout: apiUser.apiLogout,
    }),
    ...TestDomain.getActions(),
    ...reduxTest.actions,
    actionGoto: push,
    ...reduxLastUniError.actions,
  },
)
@bemDecorator({ componentName: 'StubPage', wrapper: false })
@loading((thisContext) => thisContext.state.isLoading)
export default class StubPage extends Component {
  static propTypes = {
    // ======================================================
    // @contextModules
    // ======================================================
    onGoTo: PropTypes.func,

    // ======================================================
    // @connect
    // ======================================================
    i18nInfo: PropTypes.shape({
      language: PropTypes.string,
      whitelist: PropTypes.arrayOf(PropTypes.string),
    }),
    userInfo: USER_INFO_PROPS,
    showTestPermission: PropTypes.bool,

    actionI18NChangeLanguage: PropTypes.func,
    actionChangeUser: PropTypes.func,
    actionUserLogout: PropTypes.func,

    testDomains: PropTypes.arrayOf(TestDomain.propTypes),
    actionCreateTestDomain: PropTypes.func,
    actionUpdateTestDomain: PropTypes.func,
    actionDeleteTestDomain: PropTypes.func,
    actionLoadTestGet: PropTypes.func,
    actionGoto: PropTypes.func,
    actionThrowNotAuthError: PropTypes.func,
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
  @bind()
  handleChangeUser() {
    this.props.actionChangeUser(
      this.props.userInfo.username === 'ivanovI'
        ? 'korolevaU'
        : 'ivanovI',
      '123456',
    );
  }

  @bind()
  handleClickCreateTestDomain() {
    this.props.actionCreateTestDomain({ value: Math.random() });
  }
  @bind()
  handleClickItemTestDomain(id) {
    this.props.actionUpdateTestDomain(id, { value: Math.random() });
  }
  @bind()
  handleClickRemoveTestDomain(id) {
    this.props.actionDeleteTestDomain(id);
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      onGoTo,
      i18nInfo: {
        language,
        whitelist,
      },
      userInfo: {
        username,
        displayName,
        profileImageURI,
      },
      testDomains,
      showTestPermission,
      actionI18NChangeLanguage,
      actionLoadTestGet,
      actionGoto,
      actionThrowNotAuthError,
      actionUserLogout,
    } = this.props;


    /*
      @guide - fullClassName проставляется в декораторе бэма (@bemDecorator)
      Так как мы не используем враппер, то должны сами позаботится об этом
    */
    return (
      <div className={ this.fullClassName }>
        { i18n('core:pages.StubPage.pageTitle') }

        <button onClick={ () => actionGoto(PATH_INDEX) }>
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
                    alt={ username || displayName }
                  />
                </div>
              )
            }
            <p>{ username || displayName }</p>
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

        <div>
          <button
            onClick={ () => actionLoadTestGet() }
          >
            Load test get with auth check
          </button>
        </div>

        <div>
          <Link onClick={ () => alert('opa') }>
            Test Link
          </Link>
        </div>

        <div>
          <button
            onClick={ () => onGoTo('relative', 'testModule') }
          >
            Test module routing - onGoTo
          </button>
          <ModuleLink
            modulePath={ 'relative' }
            moduleName={ 'testModule' }
          >
            Test ModuleLink
          </ModuleLink>
        </div>

        <div>
          <div>
            <button
              onClick={ () => actionUserLogout() }
            >
              Logout
            </button>
          </div>
          <button
            onClick={ () => actionThrowNotAuthError('/opa1/opa2') }
          >
            Not auth
          </button>

          <h4>
            <Link
              to="/opa3/opa4"
              checkAuth={ true }
            >
              Not auth link
            </Link>
          </h4>
          <h4>
            <Link
              to="/opa3/opa4"
              permissions="testPermissions"
            >
              Not permissions Link
            </Link>
          </h4>
        </div>

        <Segment
          label="Form"
          className="FormSegment"
        >
          <Form
            fields={ [
              {
                name: 'string',
                label: 'Text "test"',
                type: Form.FIELD_TYPES.STRING,
                required: true,
                validate: (value) => (value !== 'test' ? 'Кастомная ошибка' : null),
                onChange: () => {},
              },
              {
                name: 'numeric',
                label: 'numeric',
                type: Form.FIELD_TYPES.NUMERIC,
                constraints: {
                  maxValue: 10,
                },
                onChange: () => {},
              },
              {
                name: 'text',
                lagel: 'text',
                type: Form.FIELD_TYPES.TEXT,
                onChange: () => {},
              },
              {
                label: 'LIST',
                name: 'list',
                type: Form.FIELD_TYPES.LIST,
                options: [
                  {
                    label: 'label 1',
                    value: 'value 1',
                  },
                  {
                    label: 'bbbb',
                    value: 'bbbb',
                  },
                ],
              },
              {
                name: 'datetime',
                label: 'datetime',
                type: Form.FIELD_TYPES.DATETIME,
              },
              {
                name: 'boolean',
                label: 'boolean',
                type: Form.FIELD_TYPES.BOOLEAN,
              },
            ] }
          />
        </Segment>
      </div>
    );
  }
}
