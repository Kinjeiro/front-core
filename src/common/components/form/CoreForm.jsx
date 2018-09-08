/* eslint-disable max-len */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import bind from 'lodash-decorators/bind';

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
    isValid: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.func,
    ]),

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
  isValid() {
    const {
      isValid,
      fields,
    } = this.props;
    const { domForm } = this;

    let isValidFinal = executeVariable(isValid, null, this.props);
    if (isValidFinal === null) {
      if (domForm && domForm.checkValidity) {
        isValidFinal = domForm.checkValidity();
      }
      if (isValidFinal) {
        isValidFinal = fields.every((field) => {
          const domElement = this.domControls[field.name];
          return Field.validate(field.value, field, domElement).length === 0;
        });
      }
    }
    return isValidFinal;
  }

  // ======================================================
  // HANDLERS
  // ======================================================
  @bind()
  controlRef(field, domElement) {
    this.domControls[field.name] = domElement;
  }

  @bind()
  handleChange(fieldName, newValue) {
    const {
      onChangeField,
    } = this.props;

    return onChangeField({ [fieldName]: newValue });
  }

  @bind()
  handleSubmit(event) {
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

    if (this.isValid()) {
      return onSubmit && onSubmit(formData);
    }
    return false;
  }

  // ======================================================
  // RENDERS
  // ======================================================
  renderField(field, index) {
    const {
      className,
      name,
      label,
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
    } = this.props;

    let labelFinal = label || (i18nFieldPrefix && i18n(`${i18nFieldPrefix}.${name}.label`, {}, '', ''));
    if (!labelFinal && i18nFieldPrefix) {
      labelFinal = i18n(`${i18nFieldPrefix}.${name}`, {}, '', '');
    }
    const placeholder = textPlaceholder || (i18nFieldPrefix && i18n(`${i18nFieldPrefix}.${name}.placeholder`, {}, '', ''));
    const hint = textHint || (i18nFieldPrefix && i18n(`${i18nFieldPrefix}.${name}.hint`, {}, '', ''));
    const textDescriptionFinal = textDescription || (i18nFieldPrefix && i18n(`${i18nFieldPrefix}.${name}.description`, {}, '', ''));

    return (
      <ErrorBoundary key={ name }>
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
          value={ value }
          key={ name }
          className={ `${this.bem('field')} ${className || ''}` }
          label={ labelFinal }
          textPlaceholder={ placeholder }
          textHint={ hint }
          textDescription={ textDescriptionFinal }
          onChange={
            onChange || (onChangeField ? this.handleChange : undefined)
          }
        />
      </ErrorBoundary>
    );
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

    const actionsFinal = [];

    if (onSubmit && textActionSubmit) {
      actionsFinal.push((
        <Button
          key="submitButton"
          type="submit"
          className={ this.bem('submitButton') }
          disabled={ isFetching || !this.isValid() }
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

    let component = (
      <Layout
        id={ id }
        inModal={ inModal }

        fields={ this.renderFields() }
        actions={ this.renderActions() }
        postActions={ this.renderPostActions() }
        actionStatus={ this.renderActionStatus() }
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
          className={ this.fullClassName }
          onSubmit={ this.handleSubmit }
        >
          { component }
        </form>
      );
    } else {
      component = (
        <div
          className={ this.fullClassName }
        >
          { component }
        </div>
      );
    }

    return component;
  }
}
