import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { push } from 'react-router-redux';
import bind from 'lodash-decorators/bind';

import reduxSimpleForm from '../../../../../../common/utils/decorators/react-class/redux-simple-form';
import titled from '../../../../../../common/utils/decorators/react-class/titled';
import bemDecorator from '../../../../../../common/utils/decorators/bem-component';
import {
  appUrl,
  getFullUrl,
} from '../../../../../../common/helpers/app-urls';

// ======================================================
// REDUX
// ======================================================
import {
  getUserInfo,
} from '../../../../../../common/app-redux/selectors';
import * as reduxUserInfo from '../../redux-user-info';

// ======================================================
// COMPONENTS and STYLES
// ======================================================
import { ACTION_STATUS_PROPS } from '../../../../../../common/models/index';
import {
  SUB_TYPES,
} from '../../../../../../common/models/model-field';
import {
  PATH_INDEX,
} from '../../../../../../common/constants/routes.pathes';
import getCb from '../../../../../../common/get-components';

// ======================================================
// MODULE
// ======================================================
import i18n, { NAMESPACE } from '../../i18n';
import * as paths from '../../routes-paths-auth';

// import './ForgotPage.css';

const {
  Form,
  // Link,
} = getCb();

export const PAGE_ID = 'Forgot';

@connect(
  (globalState) => ({
    actionForgotPasswordStatus: getUserInfo(globalState).actionForgotPasswordStatus,
  }),
  {
    ...reduxUserInfo.actions,
    // actionGoTo: push,
  },
)
@reduxSimpleForm(
  PAGE_ID,
  {
    email: '',
  },
)
@titled(PAGE_ID, i18n('pages.ForgotPage.title'))
@bemDecorator({ componentName: 'Forgot', wrapper: false })
export default class Forgot extends Component {
  static PAGE_ID = PAGE_ID;
  static propTypes = {
    // ======================================================
    // PROPS
    // ======================================================
    // todo @ANKU @LOW - emailOptions
    emailOptions: PropTypes.object,

    // ======================================================
    // @reduxSimpleForm
    // ======================================================
    form: PropTypes.shape({
      email: PropTypes.string,
    }),
    onUpdateForm: PropTypes.func,

    // ======================================================
    // CONNECT
    // ======================================================
    actionForgotPasswordStatus: ACTION_STATUS_PROPS,
    actionForgotPassword: PropTypes.func,
    // actionGoTo: PropTypes.func,
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
      form: {
        email,
      },
      emailOptions,
      actionForgotPassword,
      // actionGoTo,
    } = this.props;

    return actionForgotPassword(
      email,
      getFullUrl(paths.PATH_AUTH_RESET),
      emailOptions,
    );
    // await actionGoTo(PATH_INDEX);
  }

  // ======================================================
  // RENDER
  // ======================================================
  isValid() {
    const {
      form: {
        email,
      },
    } = this.props;

    return !!(email);
  }

  getFields() {
    const {
      form: {
        email,
      },
    } = this.props;
    return [
      {
        id: 'email',
        name: 'email',
        subType: SUB_TYPES.EMAIL,
        value: email,
        instanceChange: true,
      },
    ];
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      form: {
        email,
      },
      onUpdateForm,
      actionForgotPasswordStatus,
    } = this.props;

    return (
      <Form
        id={ PAGE_ID }
        className={ this.fullClassName }
        i18nFieldPrefix={ `${NAMESPACE}:pages.ForgotPage.fields` }

        fields={ this.getFields() }
        onChangeField={ onUpdateForm }

        isValid={ this.isValid() }
        useForm={ true }

        onSubmit={ this.handleSubmit }
        textActionSubmit={ i18n('pages.ForgotPage.submitButton') }

        actionStatus={ actionForgotPasswordStatus }
        textActionSuccess={ (
          <div className={ this.bem('ActionSuccess') }>
            <div
              dangerouslySetInnerHTML={{
                __html: i18n(
                  'pages.ForgotPage.submitSuccessMessage',
                  {
                    email: `<b className="${this.bem('email-text')}">${email}</b>`,
                    // interpolation: {escapeValue: false},
                  },
                ),
              }}
            />
            <a href={ appUrl(PATH_INDEX) }>
              { i18n('pages.ForgotPage.goToIndexPage') }
            </a>
          </div>
        ) }
      />
    );
  }
}
