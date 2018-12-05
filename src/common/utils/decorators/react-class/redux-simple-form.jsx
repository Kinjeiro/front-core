import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import bind from 'lodash-decorators/bind';

import { executeVariable } from '../../common';
import ID_PROP_TYPE from '../../../models/model-id';

import {
  getForm,
} from '../../../app-redux/selectors';
import * as reduxUiForm from '../../../app-redux/reducers/ui-domains/forms';

/**
 * Декорирует компонент для отображения формы с данными. Упрощенная версия redux-form
 *
 * Автоматически инициализирует в redux store под forms свои данные и при выходе их очищает
 * @param formId - айди форма, или функция (props) => id
 * @param defaultValues - дефолтные значения
 *
 * Плюс в пропертях можно передать initValues - дефолтные значения из значений
 *
 * Возвращает компонент с доп пропертями:
 * - form - текущие данные формы
 * - formId - id формы
 * - getFormId - (props = this.props) => {}
 * - onUpdateForm - метод обновления данных
*/
export default function reduxSimpleFormDecorator(
  formId,
  defaultValues = {},
) {
  // const {
  // } = options || {};

  return (ReactComponentClass) => {
    @connect(
      (globalState, ownProps) => {
        const {
          initValues,
        } = ownProps;
        const formIdFinal = executeVariable(formId, null, ownProps);
        const initValuesFinal = {
          ...executeVariable(defaultValues, null, ownProps),
          ...executeVariable(initValues, null, ownProps),
        };
        return {
          formId: formIdFinal,
          form: getForm(globalState, formIdFinal) || initValuesFinal,
          initValues: initValuesFinal,
        };
      },
      {
        ...reduxUiForm.actions,
      },
    )
    class ExtendedComponent extends Component {
      static propTypes = {
        // ======================================================
        // PROPS
        // ======================================================
        initValues: PropTypes.oneOfType([
          PropTypes.func,
          PropTypes.object,
        ]),

        // ======================================================
        // CONNECT
        // ======================================================
        // eslint-disable-next-line react/no-unused-prop-types
        formId: ID_PROP_TYPE,
        form: PropTypes.object,
        actionFormInit: PropTypes.func,
        actionFormUpdate: PropTypes.func,
        actionFormRemove: PropTypes.func,
      };

      // ======================================================
      // UTILS
      // ======================================================
      @bind()
      getFormId(props = this.props) {
        return executeVariable(formId, null, props);
      }

      // ======================================================
      // LIFECYCLE
      // ======================================================
      // componentWillMount() {
      componentDidMount() {
        const {
          form,
          formId: formIdFinal,
          actionFormInit,
        } = this.props;
        actionFormInit(formIdFinal, form);
      }
      componentWillUnmount() {
        this.props.actionFormRemove(this.props.formId);
      }

      // ======================================================
      // HANDLERS
      // ======================================================
      @bind()
      handleUpdateForm(data) {
        this.props.actionFormUpdate(this.props.formId, data);
      }

      // ======================================================
      // MAIN RENDER
      // ======================================================
      render() {
        return (
          <ReactComponentClass
            { ...this.props }
            getFormId={ this.getFormId }
            onUpdateForm={ this.handleUpdateForm }
          />
        );
      }
    }

    return ExtendedComponent;
  };
}
