/* eslint-disable max-len */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import bind from 'lodash-decorators/bind';

import clientConfig from '../../client-config';
import bemDecorator from '../../utils/decorators/bem-component';
import i18n from '../../utils/i18n-utils';
import {
  executeVariable,
  wrapToArray,
  generateId,
} from '../../utils/common';
import { ACTION_STATUS_PROPS } from '../../models';

import getComponents from '../../get-components';

// import './CoreForm.scss';

import {
  FIELD_PROP_TYPE,
  TYPES,
} from '../../models/model-field';

const {
  // todo @ANKU @LOW - можно сделать отложенную чтобы не загружать если задали кастомный Layout
  FormLayout,

  ActionStatus,
  Button,
  Field,
  ErrorBoundary,
} = getComponents();

@bemDecorator({ componentName: 'CoreForm', wrapper: false })
export default class CoreForm extends Component {
  static FIELD_TYPES = TYPES;

  static propTypes = {
    id: PropTypes.string,
    i18nFieldPrefix: PropTypes.string,
    fields: PropTypes.arrayOf(FIELD_PROP_TYPE),
    /**
     * Для передачи в onSubmit
     */
    formData: PropTypes.object,
    onChangeField: PropTypes.func,
    /**
     * (fieldErrors, formData, props) => result
     * - fieldErrors: - [...string|{field, fieldLabel, errors}]
     * - result: - [...string|{field, fieldLabel, errors}]
     */
    validate: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.func,
    ]),
    textDefaultFormErrorText: PropTypes.node,

    inModal: PropTypes.bool,
    useForm: PropTypes.bool,

    actions: PropTypes.node,
    onSubmit: PropTypes.func,
    textActionSubmit: PropTypes.node,
    onCancel: PropTypes.func,
    textActionCancel: PropTypes.node,

    postActions: PropTypes.node,

    actionStatus: ACTION_STATUS_PROPS,
    textActionSuccess: PropTypes.node,

    firstFocus: PropTypes.bool,

    /**
     * default - FormLayout
     props:
       id
       inModal

       fields
       actions
       postActions
       actionStatus
     */
    Layout: PropTypes.any,
  };

  static defaultProps = {
    id: generateId(),
    Layout: FormLayout,
    textActionSubmit: i18n('components.CoreForm.textActionSubmit'),
    textActionCancel: i18n('components.CoreForm.textActionCancel'),
    // useForm: false,
    useForm: true,
    firstFocus: true,
    textDefaultFormErrorText: i18n('components.CoreForm.textDefaultFormErrorText'),
  };

  state = {
    formErrors: [],
    hasError: false,
    processing: false,
  };

  domForm = null;
  domControls = {};

  // ======================================================
  // LIFECYCLE
  // ======================================================
  // componentDidMount() {
  //   const { domForm } = this;
  //   if (domForm) {
  //     /**
  //      * todo @ANKU @LOW @BUG_OUT @react - в браузере \ реаке \ редуксе при автозаполнении не дергается редукс и соотвественно считается форма пустой
  //      * https://github.com/facebook/react/issues/1159
  //      * https://stackoverflow.com/questions/50204235/chrome-rises-autofill-input-event-after-clicking-the-page-only
  //      */
  //     // todo @ANKU @LOW @WORKAROUND - при малых таймауте не срабатывает - поэтому нестабильное решение
  //     setTimeout(() => {
  //       console.warn('ANKU click');
  //       // domForm.click();
  //       // console.warn('ANKU , ', domForm.querySelector('[name="username"]'));
  //       // domForm.querySelector('[name="username"]').focus();
  //       // document.body.click();
  //
  //       const evt = document.createEvent('HTMLEvents');
  //       // evt.initEvent('input', true, true);
  //       evt.initEvent('blur', true, true);
  //       domForm.querySelector('[name="username"]').dispatchEvent(evt);
  //       setTimeout(() => {
  //         domForm.querySelector('[name="username"]').focus();
  //       }, 2000);
  //     }, 2000);
  //   }
  // }

  // ======================================================
  // UTILS
  // ======================================================
  async isValid() {
    const {
      validate,
      fields,
      formData,
      textDefaultFormErrorText,
    } = this.props;
    const {
      domForm,
    } = this;

    let fieldsErrors;
    let domCheckValidityErrors = [];
    if (domForm && domForm.checkValidity && !domForm.checkValidity()) {
      domCheckValidityErrors = [textDefaultFormErrorText];
      fieldsErrors = domCheckValidityErrors;
    } else {
      // isValidFinal = fields.every(async (field) => {
      //   const domElement = this.domControls[field.name];
      //   return await Field.validate(field.value, field, domElement).length === 0;
      // });
      fieldsErrors = (await Promise.all(fields.map(async (field) => {
        const domElement = this.domControls[field.name];
        const errors = await Field.validate(field.value, field, domElement, formData);
        return errors && errors.length > 0
          ? {
            field: field.name,
            fieldLabel: this.getFieldLabel(field),
            errors,
          }
          : null;
      })))
        .filter(obj => !!obj);
    }

    const formErrors = await executeVariable(validate, null, fieldsErrors, formData, this.props);
    const formErrorsFinal = formErrors === false
      ? [textDefaultFormErrorText]
      : formErrors === true || formErrors === null
        ? domCheckValidityErrors
        : [...domCheckValidityErrors, ...formErrors];

    this.setState({
      formErrors: formErrorsFinal,
      hasError: formErrorsFinal.length > 0 || fieldsErrors.length > 0,
    });

    return formErrorsFinal.length === 0 && fieldsErrors.length === 0;
  }

  getFieldByName(fieldName) {
    return this.props.fields.find(({ name }) => fieldName === name);
  }

  emitChanging(handlerPromise) {
    if (handlerPromise && handlerPromise.then) {
      this.setState({
        processing: true,
      });
      handlerPromise
        .then(() => {
          /*
           // todo @ANKU @LOW - warning.js:33 Warning: Can only update a mounted or mounting component. This usually means you called setState, replaceState, or forceUpdate on an unmounted component. This is a no-op.
           */
          this.setState({
            processing: false,
          });
        })
        .catch(() => {
          this.setState({
            processing: false,
          });
        });
    }
    return handlerPromise;
  }

  // ======================================================
  // HANDLERS
  // ======================================================
  @bind()
  controlRef(field, domElement) {
    this.domControls[field.name] = domElement;
  }

  @bind()
  async handleChange(fieldName, newValue) {
    const {
      onChangeField,
    } = this.props;
    const {
      onChange,
    } = this.getFieldByName(fieldName);

    const result = await onChange
      ? onChange(fieldName, newValue)
      : onChangeField && onChangeField({ [fieldName]: newValue });

    this.emitChanging(this.isValid());

    return result;
  }

  @bind()
  async handleSubmit(event) {
    const {
      onSubmit,
      useForm,
      formData,
    } = this.props;

    // если <form>
    if (useForm) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (await this.emitChanging(this.isValid())) {
      return onSubmit && onSubmit(formData);
    }
    return false;
  }

  // ======================================================
  // RENDERS
  // ======================================================
  getFieldLabel(field) {
    const {
      name,
      label,
    } = field;
    const {
      i18nFieldPrefix,
    } = this.props;
    let labelFinal = label || (i18nFieldPrefix && i18n(`${i18nFieldPrefix}.${name}.label`, {}, '', ''));
    if (!labelFinal && i18nFieldPrefix) {
      labelFinal = i18n(`${i18nFieldPrefix}.${name}`, {}, '', '');
    }
    return labelFinal;
  }

  renderField(field, index) {
    const {
      className,
      name,
      textPlaceholder,
      textHint,
      textDescription,
      onChange,
      value,
    } = field;
    const {
      id,
      i18nFieldPrefix,
      onChangeField,
      firstFocus,
      formData,
    } = this.props;

    const label = this.getFieldLabel(field);
    const placeholder = textPlaceholder || (i18nFieldPrefix && i18n(`${i18nFieldPrefix}.${name}.placeholder`, {}, '', ''));
    const hint = textHint || (i18nFieldPrefix && i18n(`${i18nFieldPrefix}.${name}.hint`, {}, '', ''));
    const textDescriptionFinal = textDescription || (i18nFieldPrefix && i18n(`${i18nFieldPrefix}.${name}.description`, {}, '', ''));

    let fieldCmp = (
      <Field
        id={ `${id}_${name}` }
        { ...field }
        controlProps={
          firstFocus && index === 0
          ? {
            autoFocus: true,
            ...field.controlProps,
          }
          : field.controlProps
        }
        controlRef={ this.controlRef }
        value={ typeof value === 'undefined' ? formData[name] : value }
        key={ name }
        className={ `${this.bem('field')} ${className || ''}` }
        label={ label }
        textPlaceholder={ placeholder }
        textHint={ hint }
        textDescription={ textDescriptionFinal }
        onChange={
          onChange || (onChangeField ? this.handleChange : undefined)
        }
      />
    );

    if (!clientConfig.common.isProduction) {
      fieldCmp = (
        <ErrorBoundary key={ name }>
          { fieldCmp }
        </ErrorBoundary>
      );
    }

    return fieldCmp;
  }

  renderFields() {
    const {
      fields,
    } = this.props;

    return wrapToArray(fields).map((field, index) => this.renderField(field, index));
  }
  renderActions() {
    const {
      actions,
      useForm,
      onSubmit,
      onCancel,
      actionStatus: {
        isFetching,
      } = {},
      textActionSubmit,
      textActionCancel,
    } = this.props;
    const {
      hasError,
      processing,
    } = this.state;

    const actionsFinal = [];

    if (onSubmit && textActionSubmit) {
      actionsFinal.push((
        <Button
          key="submitButton"
          type="submit"
          className={ this.bem('submitButton') }
          disabled={ isFetching || hasError }
          primary={ true }
          onClick={ useForm ? undefined : this.handleSubmit }
        >
          { textActionSubmit }
        </Button>
      ));
    }

    actionsFinal.push(...wrapToArray(actions));

    if (onCancel && textActionCancel) {
      actionsFinal.push((
        <Button
          key="cancelButton"
          className={ `${this.bem('cancelButton')}` }
          disabled={ processing || isFetching }
          onClick={ onCancel }
          loading={ processing }
        >
          { textActionCancel }
        </Button>
      ));
    }

    return actionsFinal;
  }

  renderPostActions() {
    return this.props.postActions;
  }

  renderActionStatus() {
    const {
      actionStatus,
    } = this.props;

    return actionStatus && (
      <ActionStatus actionStatus={ actionStatus } />
    );
  }

  renderFormError() {
    const {
      formErrors,
    } = this.state;
    return formErrors.map((error) => (
      typeof error === 'string'
        ? (
          <div
            key={ error }
            className="CoreForm_error FormError"
          >
            { error }
          </div>
        )
        : error.errors.map((fieldError) => (
          <div
            key={ `${error.label}_${fieldError}` }
            className="CoreForm_error FormError"
          >
            <span className="FormError__label">
              { error.fieldLabel || error.field }:
            </span>
            <span className="FormError__error">
              { fieldError }
            </span>
          </div>
        ))
    ));
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      id,
      inModal,
      useForm,
      textActionSuccess,
      actionStatus,
      Layout,
    } = this.props;
    const {
      hasError,
    } = this.state;

    const className = `${this.fullClassName} ${hasError ? 'CoreForm--error' : ''}`;

    let component = (
      <Layout
        id={ id }
        inModal={ inModal }

        fields={ this.renderFields() }
        actions={ this.renderActions() }
        postActions={ this.renderPostActions() }
        actionStatus={ this.renderActionStatus() }
        formErrors={ this.renderFormError() }
      />
    );

    if (textActionSuccess && actionStatus) {
      component = (
        <ActionStatus
          actionStatus={ actionStatus }
          textSuccess={ textActionSuccess }
          showError={ false }
        >
          { component }
        </ActionStatus>
      );
    }

    if (useForm) {
      component = (
        <form
          id={ id }
          ref={ (domElement) => this.domForm = domElement }
          className={ className }
          onSubmit={ this.handleSubmit }
        >
          { component }
        </form>
      );
    } else {
      component = (
        <div
          id={ id }
          className={ className }
        >
          { component }
        </div>
      );
    }

    return component;
  }
}
