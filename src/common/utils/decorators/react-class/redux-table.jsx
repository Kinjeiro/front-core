/* eslint-disable react/no-unused-prop-types,no-shadow */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import merge from 'lodash/merge';
import omit from 'lodash/omit';

import {
  generateId,
  executeVariable,
} from '../../common';
import {
  parseUrlParameters,
  updateLocationQueryParams,
} from '../../uri-utils';
import {
  getMeta,
  TABLE_PROP_TYPE,
  META_PROP,
} from '../../../models/model-table';

import { getTableInfo } from '../../../app-redux/selectors';
import * as reduxTables from '../../../app-redux/reducers/app/redux-tables';

// эти методы можно и без апи использовать
const {
  actionModuleItemInit,
  actionModuleItemRemove,
  actionClearFilters,
} = reduxTables.getBindActions();

/**
 * Декорирует компонент для отображения таблицы с данными
 * Автоматически инициализирует в redux store под tables свои данные и при выходе их очищает
 * @param tableId - айди таблицы, или функция (props) => id
 *
 * Options:
 * @param loadOnMount - запускать загрузку данных при маунте
 * @param clearOnUnmount - очищать ли данные, когда компонент unmount
 * @param initMeta - (объект или функция от props) - начальная мета, которая будет перезаписана из урл параметров
 * @param initFilters - (объект или функция от props) - начальный фильтры
 * @param tableActions - actions чтобы можно было запускать тут load \\ они все передадуться в пропсы (можно в @connect не передавать
 *
 * Возвращает компонент с доп пропертями:
 * - table - текущая данные таблицы
 * - initMeta - начальная мета из options и урла
 * - initFilters - начальный фильтры из options и урла
 */
export default function reduxTableDecorator(
  tableId = generateId(),
  {
    loadOnMount = true,
    clearOnUnmount = true,
    initMeta = {},
    initFilters = {},
    tableActions,
  } = {},
) {
  return (ReactComponentClass) => {
    @connect(
      (globalState, props) => {
        const query = parseUrlParameters(props.location.search);
        return {
          table: getTableInfo(globalState, tableId),
          initMeta: getMeta(query, executeVariable(initMeta, {}, props)),
          initFilters: merge({}, executeVariable(initFilters, {}, props), query.filters),
        };
      },
      {
        actionModuleItemInit,
        actionModuleItemRemove,
        actionClearFilters,
        ...tableActions,
      },
    )
    class ExtendedComponent extends Component {
      static propTypes = {
        table: TABLE_PROP_TYPE,
        initMeta: META_PROP,
        initFilters: PropTypes.object,
        actionModuleItemInit: PropTypes.func,
        actionModuleItemRemove: PropTypes.func,
        actionClearFilters: PropTypes.func,
        actionLoadRecords: PropTypes.func,
      };

      componentWillMount() {
        const {
          initMeta,
          initFilters,
          actionModuleItemInit,
          actionLoadRecords,
          // actionClearFilters,
        } = this.props;

        const TABLE_ID = executeVariable(tableId, null, this.props);
        actionModuleItemInit(
          TABLE_ID,
          {
            meta: initMeta,
            filters: initFilters,
          },
        );
        updateLocationQueryParams({
          ...omit(initMeta, 'total'),
          filters: initFilters,
        });

        // if (clearOnMount) {
        //   actionClearFilters(TABLE_ID);
        // }

        if (loadOnMount && actionLoadRecords) {
          actionLoadRecords(TABLE_ID);
        }
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
