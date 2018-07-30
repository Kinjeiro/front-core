import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import bind from 'lodash-decorators/bind';

import reduxSimpleForm from '../../../../utils/decorators/react-class/redux-simple-form';
import titled from '../../../../utils/decorators/react-class/titled';
import bemDecorator from '../../../../utils/decorators/bem-component';
import i18n from '../../../../utils/i18n-utils';

// ======================================================
// REDUX
// ======================================================
import {
  getUserInfo,
} from '../../../../app-redux/selectors';
import * as reduxUserInfo from '../../../../app-redux/reducers/app/user-info';
import * as reduxLastUniError from '../../../../app-redux/reducers/app/last-uni-error';

// ======================================================
// COMPONENTS and STYLES
// ======================================================
import {
  ACTION_STATUS_PROPS,
} from '../../../../models';
import {
  SUB_TYPES,
} from '../../../../models/model-field';

import {
  PATH_INDEX,
} from '../../../../constants/routes.pathes';

import * as paths from '../../routes-paths-auth';

import COMPONENTS_BASE from '../../../../components/ComponentsBase';

// import './LoginPage.css';

const { Form } = COMPONENTS_BASE;

const PAGE_ID = 'Signup';

@connect(
  (globalState, ownProps) => ({
    actionSignupStatus: getUserInfo(globalState).actionSignupStatus,
    urlReturn: typeof ownProps.urlReturn !== 'undefined'
      ? ownProps.urlReturn
      : ownProps.location.query[paths.PARAM__RETURN_URL],
  }),
  {
    ...reduxUserInfo.actions,
    ...reduxLastUniError.actions,
    actionGoTo: push,
  },
)
@reduxSimpleForm(
  PAGE_ID,
  {
    username: '',
    password: '',
    email: '',
    displayName: '',
  },
)
@titled(PAGE_ID, i18n('core:pages.SignupPage.title'))
@bemDecorator({ componentName: 'SignupPage', wrapper: false })
export default class LoginPage extends Component {
  static propTypes = {
    // ======================================================
    // PROPS
    // ======================================================
    inModal: PropTypes.bool,

    // ======================================================
    // @reduxSimpleForm
    // ======================================================
    form: PropTypes.shape({
      username: PropTypes.string,
      password: PropTypes.string,
    }),
    onUpdateForm: PropTypes.func,

    // ======================================================
    // CONNECT
    // ======================================================
    actionSignupStatus: ACTION_STATUS_PROPS,
    actionSignup: PropTypes.func,
    actionGoTo: PropTypes.func,
    // actionClearLastError: PropTypes.func,
    urlReturn: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.bool,
    ]),
  };

  // ======================================================
  // LIFECYCLE
  // ======================================================
  // componentWillMount() {
  // }
  // componentWillUnmount() {
  // }

  // ======================================================
  // HANDLERS
  // ======================================================
  @bind()
  async handleSubmit() {
    const {
      form,
      actionSignup,
      actionGoTo,
      urlReturn,
    } = this.props;

    // todo @ANKU @CRIT @MAIN - тут сначала срабатывает promise, и если ответ возвращается без кода ошибки то сработает сначала then а потом запарсится uniError
    await actionSignup(form);

    if (urlReturn !== false) {
      await actionGoTo(urlReturn || PATH_INDEX);
    }
  }

  // ======================================================
  // RENDERS
  // ======================================================
  isValid() {
    const {
      form: {
        username,
        password,
        email,
      },
    } = this.props;

    return !!(username && password && email);
  }

  getFields() {
    const {
      form: {
        username,
        password,
        email,
        displayName,
      },
    } = this.props;
    return [
      {
        name: 'username',
        subType: SUB_TYPES.LOGIN,
        value: username,
      },
      {
        name: 'password',
        subType: SUB_TYPES.PASSWORD,
        value: password,
      },
      {
        name: 'email',
        subType: SUB_TYPES.EMAIL,
        value: email,
      },
      {
        name: 'displayName',
        value: displayName,
      },
    ];
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      actionSignupStatus,
      inModal,
      onUpdateForm,
    } = this.props;

    return (
      <Form
        className={ this.fullClassName }
        i18nFieldPrefix={ 'core:pages.SignupPage.fields' }

        fields={ this.getFields() }
        onChangeField={ onUpdateForm }

        isValid={ this.isValid() }
        inModal={ inModal }
        useForm={ true }

        onSubmit={ this.handleSubmit }
        textActionSubmit={ i18n('core:pages.SignupPage.submitButton') }

        actionStatus={ actionSignupStatus }
      />
    );
  }
}
