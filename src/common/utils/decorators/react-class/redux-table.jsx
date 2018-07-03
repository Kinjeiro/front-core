/* eslint-disable react/no-unused-prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  generateId,
  executeVariable,
} from '../../common';

import { getTableInfo } from '../../../app-redux/selectors';
import * as reduxTables from '../../../app-redux/reducers/app/redux-tables';
import TABLE_PROP_TYPE from '../../../models/model-table';

// эти методы можно и без апи использовать
const {
  actionModuleItemInit,
  actionModuleItemRemove,
} = reduxTables.getBindActions();

/**
 * Декорирует компонент для отображения таблицы с данными
 * Автоматически инициализирует в redux store под tables свои данные и при выходе их очищает
 * @param tableId - айди таблицы, или функция (props) => id
 * @param clearOnUnmount - очищать ли данные, когда компонент unmount
 *
 * Возвращает компонент с доп пропертями:
 * - table - текущая данные таблицы
*/
export default function reduxTableDecorator(tableId = generateId(), clearOnUnmount = true) {
  return (ReactComponentClass) => {
    @connect(
      (globalState) => ({
        table: getTableInfo(globalState, tableId),
      }),
      {
        actionModuleItemInit,
        actionModuleItemRemove,
      },
    )
    class ExtendedComponent extends Component {
      static propTypes = {
        table: TABLE_PROP_TYPE,
        actionModuleItemInit: PropTypes.func,
        actionModuleItemRemove: PropTypes.func,
      };

      componentWillMount() {
        this.props.actionModuleItemInit(executeVariable(tableId, null, this.props));
      }
      componentWillUnmount() {
        if (clearOnUnmount) {
          this.props.actionModuleItemRemove(executeVariable(tableId, null, this.props));
        }
      }

      render() {
        return <ReactComponentClass { ...this.props } />;
      }
    }

    return ExtendedComponent;
  };
}
