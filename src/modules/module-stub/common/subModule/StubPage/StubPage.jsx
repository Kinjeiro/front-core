import React, { Component } from 'react';
import PropTypes from 'prop-types';
// todo @ANKU @LOW - заменить на lodash-derocators так как там есть нормальный debouce
import bind from 'lodash-decorators/bind';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

// ======================================================
// UTILS
// ======================================================
import bemDecorator from '../../../../../common/utils/decorators/bem-component';
import loading from '../../../../../common/utils/decorators/react-class/loading';
import titled from '../../../../../common/utils/decorators/react-class/titled';
import { PATH_INDEX } from '../../../../../common/routes.pathes';

import { notifyError } from '../../../../../common/helpers/notifications';

// ======================================================
// REDUX
// ======================================================
import apiAuth from '../../../../../common/api/api-auth';

import {
  getI18NInfo,
  getUserInfo,
  hasPermission,
  getTestDomains,
} from '../../../../../common/app-redux/selectors';
import * as reduxI18nInfo from '../../../../../common/app-redux/reducers/app/i18n-info';
import * as reduxUserInfo from '../../../../../common/app-redux/reducers/app/user-info';
import * as reduxTest from '../../../../../common/app-redux/reducers/app/test';
import * as reduxLastUniError from '../../../../../common/app-redux/reducers/app/last-uni-error';
import * as reduxUsers from '../../../../../common/app-redux/reducers/app/users';

import TestDomain from '../../../../../common/models/domains/TestDomain';

// ======================================================
// COMPONENTS and STYLES
// ======================================================
import { TEST_PERMISSION } from '../../../../../common/constants/permissions';
import { USER_INFO_PROPS } from '../../../../../common/models/index';
import ListItem from '../../../../../common/components/ListItem/ListItem';
import Link from '../../../../../common/components/Link/Link';
import contextModules from '../../../../../common/contexts/ContextModules/decorator-context-modules';
import ModuleLink from '../../../../../common/containers/ModuleLink/ModuleLink';

// ======================================================
// MODULE
// ======================================================
import i18n from '../i18n';
import getComponents from '../get-components';

import './StubPage.css';
import './StubPageSass.scss';

const {
  Segment,
  Form,
  Attachment,
  UserAvatar,
} = getComponents();


const { getUserAvatarUrl } = reduxUsers;

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
    ...reduxI18nInfo.actions,
    ...reduxUserInfo.getBindActions({
      apiChangeUser: apiAuth.apiLogin,
      apiUserLogout: apiAuth.apiLogout,
    }),
    ...TestDomain.getActions(),
    ...reduxTest.actions,
    actionGoto: push,
    ...reduxLastUniError.actions,
    ...reduxUsers.actions,
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

    actionChangeUserAvatar: PropTypes.func,
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
  // RENDER
  // ======================================================
  renderTestChangeAvatar() {
    const {
      userInfo: {
        username,
        // displayName,
      },
      actionChangeUserAvatar,
    } = this.props;

    const otherUser = username === 'ivanovI' ? 'korolevaU' : 'ivanovI';

    return (
      <Segment
        label="Test avatars"
      >
        <div>
          <h3>{ username }</h3>
          <UserAvatar
            username={ username }
          />
        </div>
        <div>
          <h3>{ otherUser }</h3>
          <UserAvatar
            username={ otherUser }
          />
        </div>
        <Attachment
          onChange={ (event) => {
            return actionChangeUserAvatar(event.target.files[0]);
          } }
        />
      </Segment>
    );
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
        // profileImageURI,
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
            <div>
              <img
                src={ getUserAvatarUrl(username) }
                alt={ username || displayName }
              />
            </div>
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

        { this.renderTestChangeAvatar() }

      </div>
    );
  }
}
