/* eslint-disable max-len */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import bind from 'lodash-decorators/bind';

import clientConfig from '../../../../../../common/client-config';
import bemDecorator from '../../../../../../common/utils/decorators/bem-component';
import {
  executeVariable,
  wrapToArray,
  generateId,
  emitProcessing,
} from '../../../../../../common/utils/common';
import { ACTION_STATUS_PROPS } from '../../../../../../common/models';

import {
  FIELD_PROP_TYPE,
  TYPES,
} from '../../../../../../common/models/model-field';

// ======================================================
// MODULE
// ======================================================
import getComponents from '../../get-components';
import i18n from '../../i18n';

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
    fields: PropTypes.arrayOf(PropTypes.oneOfType([
      FIELD_PROP_TYPE,
      PropTypes.node,
    ])),
    /**
     * Для передачи в onSubmit
     */
    formData: PropTypes.object,
    onChangeField: PropTypes.func,
    /**
     (fieldErrors, formData, props) => result
     Где fieldErrors: [...string|{field, fieldLabel, errors}]

     Где result: string|boolean|[...string|{field, fieldLabel, errors}]
     - если false: ошибка с текстом textDefaultFormErrorText
     - если true | null | undefined: не будет ошибок (не смотря на fieldErrors)
     - если массив: выведется массив ошибок
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
    actionStatusComponentProps: PropTypes.shape(ActionStatus.propTypes),

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
    formData: {},
  };

  state = {
    formErrors: [],
    hasError: false,
    isProcessing: false,
    touched: false,
    hasSendOnce: false,
    dependentFieldsHashes: {},
  };

  domForm = null;
  domControls = {};
  unmount = false;

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
  componentWillUnmount() {
    this.unmount = true;
  }

  // ======================================================
  // UTILS
  // ======================================================
  async isValid(newValues = {}) {
    const {
      validate,
      fields,
      formData,
      textDefaultFormErrorText,
    } = this.props;
    const {
      domForm,
    } = this;

    let fieldsErrors = null;
    if (domForm && domForm.checkValidity && !domForm.checkValidity()) {
      // domCheckValidityErrors = [textDefaultFormErrorText];
      // fieldsErrors = domCheckValidityErrors;
      fieldsErrors = [textDefaultFormErrorText];
    } else {
      // isValidFinal = fields.every(async (field) => {
      //   const domElement = this.domControls[field.name];
      //   return await Field.validate(field.value, field, domElement).length === 0;
      // });
      fieldsErrors = (await Promise.all(fields.map(async (field, index) => {
        const {
          name,
        } = field;

        const domElement = this.domControls[name];
        let value = newValues[name];
        if (typeof value === 'undefined') {
          value = this.getFieldValue(name, field);
        }
        const errors = await Field.validate(
          value,
          this.gerFieldProps(field, index),
          domElement,
          this.getFormData,
        );
        return errors && errors.length > 0
          ? {
            field: name,
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
        ? []
        : formErrors;

    this.setState({
      formErrors: formErrorsFinal,
      hasError: formErrorsFinal.length > 0 || fieldsErrors.length > 0,
    });

    return formErrorsFinal.length === 0 && fieldsErrors.length === 0;
  }

  getFieldByName(fieldName) {
    return this.props.fields.find(({ name }) => fieldName === name);
  }

  @bind()
  getFormData() {
    return this.props.formData;
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
      touched,
    } = this.state;
    const {
      onChange,
    } = this.getFieldByName(fieldName);

    if (!touched) {
      this.setState({
        touched: true,
      });
    }

    // todo @ANKU @LOW - нужно onChange тоже включить в процессинг, но почему-то падают странности
    const result = await onChange
      ? onChange(fieldName, newValue)
      : onChangeField && onChangeField({ [fieldName]: newValue });

    emitProcessing(
      this.isValid({
        [fieldName]: newValue,
      }),
      this,
    );

    return result;
  }

  @bind()
  async asyncSubmit() {
    const {
      onSubmit,
      useForm,
      formData,
    } = this.props;

    if (await this.isValid()) {
      if (onSubmit) {
        await onSubmit(formData);
      }
      // может получится так, что после submit будет редирект и компонент заанмаунтится, поэтому setState будет падать с ошибкой - это нормально
      if (!this.unmount) {
        this.setState({
          touched: false,
          hasSendOnce: true,
        });
      }
    }
  }

  @bind()
  async handleSubmit(event) {
    const {
      useForm,
    } = this.props;

    // если <form>
    if (useForm) {
      event.preventDefault();
      event.stopPropagation();
    }

    await emitProcessing(this.asyncSubmit, this, 'isProcessing');
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

  getFieldValue(fieldName, fieldProp = null) {
    const {
      formData,
    } = this.props;

    let value;
    if (fieldProp) {
      value = fieldProp.value;
    }
    if (typeof value === 'undefined') {
      value = formData[fieldName];
    }
    return value;
  }

  gerFieldProps(field, index) {
    const {
      className,
      name,
      textPlaceholder,
      textHint,
      textDescription,
      onChange,
      value,
      formDependentFields = [],
    } = field;
    const {
      id,
      i18nFieldPrefix,
      onChangeField,
      // firstFocus,
      formData,
    } = this.props;
    const {
      isProcessing,
    } = this.state;

    const label = this.getFieldLabel(field);
    const placeholder = textPlaceholder || (i18nFieldPrefix && i18n(`${i18nFieldPrefix}.${name}.placeholder`,
        {},
        '',
        ''));
    const hint = textHint || (i18nFieldPrefix && i18n(`${i18nFieldPrefix}.${name}.hint`, {}, '', ''));
    const textDescriptionFinal = textDescription || (i18nFieldPrefix && i18n(`${i18nFieldPrefix}.${name}.description`,
        {},
        '',
        ''));

    const formDependentData = wrapToArray(formDependentFields)
      .reduce((result, otherFieldName) => {
        // eslint-disable-next-line no-param-reassign
        result[otherFieldName] = this.getFieldValue(otherFieldName);
        return result;
      }, {});

    return {
      id: `${id}_${name}`,
      ...field,
      // пока форма находится в процессе сабмита никакие изменения вносить нельзя
      readOnly: isProcessing || field.readOnly,
      // controlProps: firstFocus && index === 0
      //   ? {
      //     autoFocus: true,
      //     ...field.controlProps,
      //   }
      //   : field.controlProps,
      controlRef: this.controlRef,
      value: this.getFieldValue(name, field),
      key: name,
      className: `${this.bem('field')} ${className || ''}`,
      label,
      textPlaceholder: placeholder,
      textHint: hint,
      textDescription: textDescriptionFinal,
      onChange: onChange || (onChangeField ? this.handleChange : undefined),
      formDependentData,
      getFormData: this.getFormData,
    };
  }

  renderField(field, index) {
    const {
      name,
    } = field;

    let fieldCmp;
    if (typeof field === 'string' || React.isValidElement(field)) {
      fieldCmp = field;
    } else {
      fieldCmp = (
        <Field
          { ...this.gerFieldProps(field, index) }
        />
      );
    }

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

    return wrapToArray(fields)
      .map((field, index) =>
        this.renderField(field, index));
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
      isProcessing,
      touched,
      hasSendOnce,
    } = this.state;

    const actionsFinal = [];

    if (onSubmit && textActionSubmit) {
      actionsFinal.push((
        <Button
          key="submitButton"
          type="submit"
          className={ this.bem('submitButton') }
          primary={ true }
          disabled={ isProcessing || isFetching || hasError || (!touched && !hasSendOnce) }
          loading={ isProcessing || isFetching }
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
          disabled={ isFetching }
          onClick={ onCancel }
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
      actionStatusComponentProps,
      Layout,
    } = this.props;
    const {
      touched,
      hasError,
      isProcessing,
    } = this.state;

    const className = `\
      ${this.fullClassName}\
      ${touched && hasError ? 'CoreForm--error' : ''}\
      ${isProcessing ? 'CoreForm--processing' : ''}\
    `;

    let component = (
      <Layout
        id={ id }
        inModal={ inModal }

        fields={ this.renderFields() }
        actions={ this.renderActions() }
        postActions={ this.renderPostActions() }
        actionStatus={ this.renderActionStatus() }
        formErrors={ touched ? this.renderFormError() : undefined }
      />
    );

    if (textActionSuccess && actionStatus) {
      component = (
        <ActionStatus
          actionStatus={ actionStatus }
          textSuccess={ !touched && textActionSuccess }
          showError={ false }
          replaceForm={ false }
          { ...actionStatusComponentProps }
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
