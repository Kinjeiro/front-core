import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  generateId,
  executeVariable,
} from '../../common';

import * as reduxTables from '../../../app-redux/reducers/app/redux-tables';

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
*/
export default function reduxTableDecorator(tableId = generateId(), clearOnUnmount = true) {
  return (ReactComponentClass) => {
    @connect(
      null,
      {
        actionModuleItemInit,
        actionModuleItemRemove,
      },
    )
    class ExtendedComponent extends Component {
      static propTypes = {
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
