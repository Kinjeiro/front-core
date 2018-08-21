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
  static FIELD_TYPES = Field.TYPES;

  static propTypes = {
    id: PropTypes.string,
    i18nFieldPrefix: PropTypes.string,
    fields: PropTypes.arrayOf(PropTypes.shape(Field.propTypes)),
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
  };

  domForm = null;
  domControls = {};

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
  renderField(field) {
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
          controlRef={ this.controlRef }
          value={ value }
          key={ name }
          className={ `${this.bem('field')} ${className || ''}` }
          label={ labelFinal }
          textPlaceholder={ placeholder }
          textHint={ hint }
          textDescription={ textDescriptionFinal }
          onChange={
            onChange
            || (
              onChangeField
              ? (fieldName, newValue) => onChangeField({ [name]: newValue })
              : undefined
            )
          }
        />
      </ErrorBoundary>
    );
  }

  renderFields() {
    const {
      fields,
    } = this.props;

    return wrapToArray(fields).map((field) => this.renderField(field));
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
