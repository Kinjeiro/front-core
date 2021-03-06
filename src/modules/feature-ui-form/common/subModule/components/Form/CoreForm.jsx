/* eslint-disable max-len */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import bind from 'lodash-decorators/bind';
import set from 'lodash/set';
import get from 'lodash/get';
import pick from 'lodash/pick';
import cloneDeep from 'lodash/cloneDeep';

import clientConfig from '../../../../../../common/client-config';
// import { createJsonPatchOperation } from '../../../../../../common/utils/api-utils';
import bemDecorator from '../../../../../../common/utils/decorators/bem-component';
import {
  executeVariable,
  wrapToArray,
  generateId,
  emitProcessing,
} from '../../../../../../common/utils/common';
import { ACTION_STATUS_PROPS } from '../../../../../../common/models';
import {
  findInTree,
  treeToArray,
} from '../../../../../../common/utils/tree-utils';

// ======================================================
// MODULE
// ======================================================
import {
  FIELD_PROP_TYPE,
  FIELD_TYPES, GROUPING_ATTRIBUTE_INNER_FIELDS,
} from '../../model-field';

import getComponents from '../../get-components';
import i18n from '../../i18n';

const {
  // todo @ANKU @LOW - можно сделать отложенную чтобы не загружать если задали кастомный Layout
  FormLayout,
  FormView,

  ActionStatus,
  Button,
  Field,
  // FieldLayout,
  FieldsetLayout,
  ErrorBoundary,
} = getComponents();

require('./CoreForm.css');

@bemDecorator({ componentName: 'CoreForm', wrapper: false })
export default class CoreForm extends Component {
  static FIELD_TYPES = FIELD_TYPES;

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
    /**
     * Начальные значения (которые могут потом меняться), но весь основной стейт находится внутри формы.
     * Это подходит для форм с фильтрами, где есть кнопочка "Применить". Загружаем из урла начальные значения, потом внутри формы выбираем значения полей, нажимаем "применить" и обновляется таблица и initFormData (а вместе с ней и state этой формы)
     */
    initFormData: PropTypes.object,

    readOnly: PropTypes.bool,
    /**
     * (newFormPartValue) => {}
     * приходит только часть и нужно делать merge в обработчике
     * {
     *   address: {
     *     city: 'Moscow'
     *   }
     * }
     */
    onChangeField: PropTypes.func,
    /**
     * (newFullFormData) => {}
     * Идеально подходит onUpdateForm из redux-simple-form декоратор для редукс
     */
    onUpdateForm: PropTypes.func,
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

    showErrorsOnDisabledSubmit: PropTypes.bool,
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
    Layout: FormLayout,
    textActionSubmit: i18n('components.CoreForm.textActionSubmit'),
    textActionCancel: i18n('components.CoreForm.textActionCancel'),
    // useForm: false,
    useForm: true,
    firstFocus: true,
    textDefaultFormErrorText: i18n('components.CoreForm.textDefaultFormErrorText'),
  };

  state = {
    id: this.props.id || generateId(),
    formErrors: [],
    hasError: false,
    isProcessing: false,
    isValidating: false,
    touched: false,
    hasSendOnce: false,
    dependentFieldsHashes: {},
    formDataInState: typeof this.props.formData !== 'undefined'
      ? this.props.formData // чтобы без редукса работать
      : this.props.initFormData || {},
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
  componentDidUpdate(prevProps, prevState, snapshot) {
    const {
      formData,
      initFormData,
    } = this.props;

    if (formData !== prevProps.formData) {
      this.setState({
        // полная замена, так как полное управление через пропсы
        formDataInState: formData,
      });
    }
    if (initFormData !== prevProps.initFormData) {
      this.setState((prev) => ({
        formDataInState: {
          // обновляем начальные позиции, но только те, которые подаются, остальное управляемое не трогаем
          ...prev.formDataInState,
          ...initFormData,
        },
      }));
    }
  }

  componentWillUnmount() {
    this.unmount = true;
  }


  // ======================================================
  // UTILS
  // ======================================================
  getAllFields() {
    const {
      fields,
    } = this.props;

    return treeToArray(fields, {
      fieldChildren: GROUPING_ATTRIBUTE_INNER_FIELDS,
    });
  }

  async isValid(newValues = {}) {
    const {
      validate,
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

      fieldsErrors = (
        await Promise.all(this.getAllFields().map(
          async (field, index) => {
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
          }
        ))
      )
        .filter(obj => !!obj);
    }

    const formErrors = await executeVariable(
      validate,
      null,
      fieldsErrors,
      this.getFormData(),
      this.props,
    );
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
    // return this.props.fields.find(({ name }) => fieldName === name);
    return findInTree(
      this.props.fields,
      fieldName,
      {
        fieldSearch: 'name',
        fieldChildren: GROUPING_ATTRIBUTE_INNER_FIELDS,
      },
    );
  }

  // isManagedComponent() {
  //   const {
  //     onChangeField,
  //     onUpdateForm,
  //   } = this.props;
  //   return onChangeField || onUpdateForm;
  // }

  @bind()
  getFormData() {
    const {
      formData,
    } = this.props;
    const {
      formDataInState,
    } = this.state;

    // return this.isManagedComponent()
    return typeof formData !== 'undefined'
      ? formData // управляемый компонент, к примеру через редукс
      : formDataInState; // управляет собой сам
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
      onUpdateForm,
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

    if (onChange) {
      // todo @ANKU @LOW - нужно onChange тоже включить в процессинг, но почему-то падают странности
      await onChange(fieldName, newValue);
    }

    // управляемый компонент
    if (onChangeField) {
      // const resultFormData = cloneDeep(formData);
      const resultFormData = {};
      // fieldName может быть составным: address.city
      set(resultFormData, fieldName, newValue);
      // todo @ANKU @LOW - может сделать createJsonPatchOperation
      await onChangeField(resultFormData);
    }
    if (onUpdateForm) {
      const resultFormData = cloneDeep(this.getFormData());
      // fieldName может быть составным: address.city
      set(resultFormData, fieldName, newValue);
      await onUpdateForm(resultFormData);
    }

    // не управляемый компонент
    const resultFormData = cloneDeep(this.getFormData());
    // fieldName может быть составным: address.city
    set(resultFormData, fieldName, newValue);
    this.setState({
      formDataInState: resultFormData,
    });

    return emitProcessing(
      this.isValid(set({}, fieldName, newValue)),
      this,
      'isValidating',
    );
  }

  @bind()
  async asyncSubmit() {
    const {
      onSubmit,
    } = this.props;

    if (await this.isValid()) {
      if (onSubmit) {
        await onSubmit(this.getFormData());
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

    return emitProcessing(this.asyncSubmit(), this, 'isProcessing');
  }

  @bind()
  async handleCancel(event) {
    const {
      onCancel,
    } = this.props;

    if (onCancel) {
      const prevData = this.getFormData();
      await onCancel(prevData);
    }

    this.setState({
      formDataInState: {},
    });
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
    let labelFinal = label === null || label === false
      ? null
      : label || (i18nFieldPrefix && i18n(`${i18nFieldPrefix}.${name}.label`, {}, '', ''));

    if (labelFinal !== null && !labelFinal && i18nFieldPrefix) {
      labelFinal = i18n(`${i18nFieldPrefix}.${name}`, {}, '', '');
    }
    return labelFinal;
  }

  getFieldValue(fieldName, fieldProp = null) {
    let value;
    if (fieldProp) {
      value = fieldProp.value;
    }
    if (typeof value === 'undefined') {
      value = get(this.getFormData(), fieldName);
    }
    return value;
  }

  @bind()
  gerFieldProps(field, index) {
    if (typeof field === 'string') {
      return null;
    }

    const {
      type,
      className,
      name,
      placeholder,
      textPlaceholder,
      title,
      textHint,
      textDescription,
      onChange,
      value,
      formDependentFields = [],
    } = field;
    const {
      i18nFieldPrefix,
      onChangeField,
      onUpdateForm,
      readOnly: formReadOnly,
      // firstFocus,
    } = this.props;
    const {
      id,
      isProcessing,
      isValidating,
    } = this.state;

    const label = this.getFieldLabel(field);
    const placeholderFinal = placeholder || textPlaceholder || (i18nFieldPrefix && i18n(`${i18nFieldPrefix}.${name}.placeholder`,
        {},
        '',
        ''));
    const titleFinal = title || (i18nFieldPrefix && i18n(`${i18nFieldPrefix}.${name}.title`, {}, '', ''));
    const hint = textHint || (i18nFieldPrefix && i18n(`${i18nFieldPrefix}.${name}.hint`, {}, '', ''));
    const textDescriptionFinal = textDescription || (i18nFieldPrefix && i18n(`${i18nFieldPrefix}.${name}.description`,
        {},
        '',
        ''));

    const formDependentData = wrapToArray(formDependentFields)
      .reduce((result, otherFieldName) => {
        // eslint-disable-next-line no-param-reassign
        set(result, otherFieldName, this.getFieldValue(otherFieldName));
        return result;
      }, {});

    // if (type === FIELD_TYPES.GROUPING) {
    //   return field;
    // }

    return {
      id: `${id}_${name}`,
      ...field,
      // пока форма находится в процессе сабмита никакие изменения вносить нельзя
      readOnly: formReadOnly || isProcessing || isValidating || field.readOnly,
      // controlProps: firstFocus && index === 0
      //   ? {
      //     autoFocus: true,
      //     ...field.controlProps,
      //   }
      //   : field.controlProps,
      controlRef: this.controlRef,
      key: name,
      className: `${this.bem('field')} ${className || ''}`,
      label,
      placeholder: placeholderFinal,
      textPlaceholder: placeholderFinal,
      title: titleFinal,
      textHint: hint,
      textDescription: textDescriptionFinal,
      formDependentData,
      getFormData: this.getFormData,

      value: this.getFieldValue(name, field),
      // onChange: onChange || ((onChangeField || onUpdateForm) ? this.handleChange : undefined),
      onChange: this.handleChange,
    };
  }

  @bind()
  renderDefaultGrouping(groupingField, index, innerFieldComponents, innerFieldProps) {
    const {
      name = `grouping_${index}`,
      className,

      nodeBefore,
      nodeAfter,
      fields,

      ...otherProps
    } = groupingField;

    return (
      <FieldsetLayout
        key={ name }
        { ...pick(otherProps, Object.keys(FieldsetLayout.propTypes)) }
        className={ `CoreForm__grouping ${name} ${className || ''}` }
      >
        { nodeBefore }
        { innerFieldComponents }
        { nodeAfter }
      </FieldsetLayout>
    );
  }

  @bind()
  renderField(field, index) {
    const {
      name,
      type,
    } = field;

    if (type === FIELD_TYPES.GROUPING) {
      const groupingField = this.gerFieldProps(field, index);

      const {
        [GROUPING_ATTRIBUTE_INNER_FIELDS]: groupingFields = [],
        renderGrouping = this.renderDefaultGrouping,
      } = groupingField;

      return renderGrouping(
        groupingField,
        index,
        groupingFields.map(this.renderField),
        groupingFields.map(this.gerFieldProps),
      )
    }

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
      showErrorsOnDisabledSubmit,
      actionStatus: {
        isFetching,
      } = {},
      textActionSubmit,
      textActionCancel,
    } = this.props;
    const {
      hasError,
      isProcessing,
      isValidating,
      touched,
      hasSendOnce,
    } = this.state;

    const actionsFinal = [];


    if (onSubmit && textActionSubmit) {
      const isDisabled = isProcessing || isValidating || isFetching || hasError || (!touched && !hasSendOnce);

      let control = (
        <Button
          key="submitButton"
          type="submit"
          className={ this.bem('submitButton') }
          primary={ true }
          disabled={ isDisabled }
          loading={ isProcessing || isValidating || isFetching }
          onClick={ useForm ? undefined : this.handleSubmit }
        >
          { textActionSubmit }
        </Button>
      );

      if (showErrorsOnDisabledSubmit && isDisabled && hasError) {
        const errorStrings = this.getFormErrors();
        control = (
          <div
            key="submitButtonWrapper"
            className={ this.bem('submitButtonWrapper') }
            title={ errorStrings }
          >
            { control }
          </div>
        );
      }
      actionsFinal.push(control);
    }

    actionsFinal.push(...wrapToArray(actions));

    if (
      textActionCancel !== CoreForm.defaultProps.textActionCancel
      || (onCancel && textActionCancel)
    ) {
      actionsFinal.push((
        <Button
          key="cancelButton"
          className={ `${this.bem('cancelButton')}` }
          disabled={ isFetching }
          onClick={ this.handleCancel }
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

  getFormErrors() {
    const {
      formErrors,
    } = this.state;
    return formErrors.reduce(
      (result, error) => {
        if (typeof error === 'string') {
          result.push(error)
        } else if (error.errors) {
          result.push(...error.errors.map((fieldError) =>
            `${error.fieldLabel || error.field}: ${fieldError}`))
        }
        return result;
      },
      []
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
      inModal,
      useForm,
      textActionSuccess,
      actionStatus,
      actionStatusComponentProps,
      Layout,
    } = this.props;
    const {
      id,
      touched,
      hasError,
      isProcessing,
      isValidating,
    } = this.state;

    const className = `\
      ${this.fullClassName}\
      ${touched && hasError ? 'CoreForm--error' : ''}\
      ${isProcessing || isValidating ? 'CoreForm--processing' : ''}\
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
        <FormView
          id={ id }
          ref={ (domElement) => this.domForm = domElement }
          className={ className }
          onSubmit={ this.handleSubmit }
        >
          { component }
        </FormView>
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
