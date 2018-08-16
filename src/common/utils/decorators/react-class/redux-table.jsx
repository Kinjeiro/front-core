/* eslint-disable react/no-unused-prop-types,no-shadow */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  push,
  replace,
} from 'react-router-redux';
import merge from 'lodash/merge';
// import omit from 'lodash/omit';

import {
  generateId,
  executeVariable,
} from '../../common';
import {
  parseUrlParameters,
  updateLocationSearch,
} from '../../uri-utils';
import {
  getMeta,
  TABLE_PROP_TYPE,
  META_PROP,
} from '../../../models/model-table';

import { getTableInfo } from '../../../app-redux/selectors';
import * as reduxTables from '../../../app-redux/reducers/app/redux-tables';

import getComponents from '../../../get-components';

const CB = getComponents();

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
 * @param loadOnMount - запускать загрузку данных при маунте (componentWillMount)
 * @param loadOnChange - если изменилась мета или фильтры - запускает загрузку в componentWillReceiveProps
 * @param clearOnUnmount - очищать ли данные, когда компонент unmount (componentWillUnmount)
 * @param initMeta - (объект или функция от props) - начальная мета, которая будет перезаписана из урл параметров
 * @param initFilters - (объект или функция от props) - начальный фильтры
 * @param tableActions - actions чтобы можно было запускать тут load \\ они все передадуться в пропсы (можно в @connect не передавать
 * @param useLoading - использовать лоадинг для первоначальной загрузки
 *
 * Возвращает компонент с доп пропертями:
 * - table - текущая данные таблицы
 * - tableId - id таблицы, удобно если он зависит от пропсов
 * - initMeta - начальная мета из options и урла
 * - initFilters - начальный фильтры из options и урла
 */
export default function reduxTableDecorator(
  tableId = generateId(),
  {
    loadOnMount = true,
    loadOnChange = true,
    clearOnUnmount = true,
    initMeta = {},
    initFilters = {},
    tableActions,
    useLoading = true,
  } = {},
) {
  return (ReactComponentClass) => {
    @connect(
      (globalState, props) => {
        const query = parseUrlParameters(props.location.search);
        const tableIdFinal = executeVariable(tableId, null, props);
        return {
          table: getTableInfo(globalState, tableIdFinal),
          tableId: tableIdFinal,
          initMeta: getMeta(query, executeVariable(initMeta, {}, props)),
          initFilters: merge({}, executeVariable(initFilters, {}, props), query.filters),
        };
      },
      {
        actionModuleItemInit,
        actionModuleItemRemove,
        actionClearFilters,
        ...tableActions,
        actionPushState: push,
        actionReplaceState: replace,
      },
    )
    class ExtendedComponent extends Component {
      static propTypes = {
        table: TABLE_PROP_TYPE,
        tableId: PropTypes.string,
        initMeta: META_PROP,
        initFilters: PropTypes.object,
        actionModuleItemInit: PropTypes.func,
        actionModuleItemRemove: PropTypes.func,
        actionClearFilters: PropTypes.func,
        actionLoadRecords: PropTypes.func,

        location: PropTypes.object,
        actionPushState: PropTypes.func,
        actionReplaceState: PropTypes.func,
      };

      componentWillMount() {
        const {
          tableId,
          location,
          initMeta,
          initFilters,
          actionModuleItemInit,
          actionLoadRecords,
          // actionClearFilters,
          // actionPushState,
          actionReplaceState,
        } = this.props;

        actionModuleItemInit(
          tableId,
          {
            meta: initMeta,
            filters: initFilters,
          },
        );

        // if (clearOnMount) {
        //   actionClearFilters(TABLE_ID);
        // }

        if (loadOnMount && actionLoadRecords) {
          // replace
          actionLoadRecords(tableId, undefined, undefined, false, true);
        } else {
          // если не загружаем, то вручную обновим урл
          actionReplaceState({
            ...location,
            search: updateLocationSearch(
              location.search,
              {
                ...initMeta,
                filters: initFilters,
              }),
          });
        }
      }
      componentWillReceiveProps(newProps) {
        const {
          tableId,
          initMeta,
          initFilters,
          // actionClearFilters,
          actionLoadRecords,
        } = newProps;

        if (loadOnChange && actionLoadRecords) {
          actionLoadRecords(tableId, initMeta, initFilters);
        }
      }
      componentWillUnmount() {
        const {
          tableId,
          actionModuleItemRemove,
        } = this.props;
        if (clearOnUnmount) {
          actionModuleItemRemove(tableId);
        }
      }

      render() {
        const {
          table: {
            actionLoadRecordsStatus: {
              isLoaded,
            } = {},
          } = {},
        } = this.props;

        if (useLoading && !isLoaded) {
          return (
            <CB.Loading
              className="ReduxTableLoading ReduxTableLoading--init"
            />
          );
        }

        return <ReactComponentClass { ...this.props } />;
      }
    }

    return ExtendedComponent;
  };
}
