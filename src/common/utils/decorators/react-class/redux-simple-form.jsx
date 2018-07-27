import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import bind from 'lodash-decorators/bind';

import { executeVariable } from '../../common';

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
 * Возвращает компонент с доп пропертями:
 * - form - текущие данные формы
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
      (globalState, ownProps) => ({
        form: getForm(globalState, executeVariable(formId, null, ownProps)) || defaultValues,
      }),
      {
        ...reduxUiForm.actions,
      },
    )
    class ExtendedComponent extends Component {
      static propTypes = {
        // ======================================================
        // CONNECT
        // ======================================================
        // eslint-disable-next-line react/no-unused-prop-types
        form: PropTypes.object,
        actionFormInit: PropTypes.func,
        actionFormUpdate: PropTypes.func,
        actionFormRemove: PropTypes.func,
      };

      // ======================================================
      // UTILS
      // ======================================================
      getFormId() {
        return executeVariable(formId, null, this.props);
      }

      // ======================================================
      // LIFECYCLE
      // ======================================================
      componentWillMount() {
        this.props.actionFormInit(this.getFormId(), defaultValues);
      }
      componentWillUnmount() {
        this.props.actionFormRemove(this.getFormId());
      }

      // ======================================================
      // HANDLERS
      // ======================================================
      @bind()
      handleUpdateForm(data) {
        this.props.actionFormUpdate(this.getFormId(), data);
      }

      // ======================================================
      // MAIN RENDER
      // ======================================================
      render() {
        return (
          <ReactComponentClass
            { ...this.props }
            onUpdateForm={ this.handleUpdateForm }
          />
        );
      }
    }

    return ExtendedComponent;
  };
}
