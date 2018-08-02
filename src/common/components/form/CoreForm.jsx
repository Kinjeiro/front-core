/* eslint-disable max-len */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import bind from 'lodash-decorators/bind';

import bemDecorator from '../../utils/decorators/bem-component';
import i18n from '../../utils/i18n-utils';
import {
  executeVariable,
  wrapToArray,
  isEmpty,
} from '../../utils/common';
import { ACTION_STATUS_PROPS } from '../../models';

import COMPONENTS_BASE from '../ComponentsBase';

// import './CoreForm.scss';

const {
  FormLayout,
  ActionStatus,
  Button,
  Field,
} = COMPONENTS_BASE;


@bemDecorator({ componentName: 'CoreForm', wrapper: false })
export default class CoreForm extends PureComponent {
  static FIELD_TYPES = Field.TYPES;

  static propTypes = {
    id: PropTypes.string,
    i18nFieldPrefix: PropTypes.string,
    fields: PropTypes.arrayOf(PropTypes.shape(Field.propTypes)),
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
  };

  static defaultProps = {
    textActionSubmit: i18n('components.CoreForm.textActionSubmit'),
    textActionCancel: i18n('components.CoreForm.textActionCancel'),
    useForm: false,
  };

  // ======================================================
  // UTILS
  // ======================================================
  isValid() {
    const {
      isValid,
      fields,
    } = this.props;

    let isValidFinal = executeVariable(isValid, null, this.props);
    if (isValidFinal === null) {
      isValidFinal = !fields.some(({ required, value, constraints = {} }) =>
        (required || constraints.required) && !isEmpty(value));
    }
    return isValidFinal;
  }

  // ======================================================
  // HANDLERS
  // ======================================================
  @bind()
  handleSubmit(event) {
    const {
      onSubmit,
      useForm,
    } = this.props;

    // если <form>
    if (useForm) {
      event.preventDefault();
      event.stopPropagation();
    }

    return onSubmit && onSubmit(event);
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
      onChange,
      value,
    } = field;
    const {
      i18nFieldPrefix,
      onChangeField,
    } = this.props;

    let labelFinal = label || (i18nFieldPrefix && i18n(`${i18nFieldPrefix}.${name}.label`, {}, '', ''));
    if (!labelFinal && i18nFieldPrefix) {
      labelFinal = i18n(`${i18nFieldPrefix}.${name}`, {}, '', '');
    }
    const placeholder = textPlaceholder || (i18nFieldPrefix && i18n(`${i18nFieldPrefix}.${name}.placeholder`, {}, '', ''));
    const hint = textHint || (i18nFieldPrefix && i18n(`${i18nFieldPrefix}.${name}.hint`, {}, '', ''));

    return (
      <Field
        { ...field }
        value={ value }
        key={ name }
        className={ `${this.bem('field')} ${className || ''}` }
        label={ labelFinal }
        textPlaceholder={ placeholder }
        textHint={ hint }
        onChange={
          onChange
          || (
            onChangeField
            ? (fieldName, newValue) => onChangeField({ [name]: newValue })
            : undefined
          )
        }
      />
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
    } = this.props;

    let component = (
      <FormLayout
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
