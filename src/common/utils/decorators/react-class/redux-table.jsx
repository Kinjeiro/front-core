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
import bind from 'lodash-decorators/bind';

import {
  generateId,
  executeVariable,
} from '../../common';
import {
  parseUrlParameters,
  updateLocationSearch,
} from '../../uri-utils';
import { cutContextPath } from '../../../helpers/app-urls';

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
 * @param tableId - айди таблицы, или функция (props) => id. !!! Если зависит от table meta или filters то не используйте actionLoadRecords со старым id (вместо этого используйте onUpdateTableFilters и onUpdateTableMeta)
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
 * - tableId - id таблицы
 * - getTableId - (props = this.props) => {} id таблицы, удобно если он зависит от пропсов
 * - initMeta - начальная мета из options и урла
 * - initFilters - начальный фильтры из options и урла
 * - onUpdateTableFilters - (newFilters, replaceAll = false) => {} укороченная записть для actionLoadRecords. Фильтры тут не замекняеются, а мержатся
 * - onUpdateTableMeta - (newMeta, replaceAll = false) начальный фильтры из options и урла
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
    class ReduxTableExtendedComponent extends Component {
      static propTypes = {
        table: TABLE_PROP_TYPE,
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

      componentWillMount(props = this.props) {
        const {
          initMeta,
          initFilters,
          actionModuleItemInit,
          actionLoadRecords,
          // actionClearFilters,
          // actionPushState,
        } = props;

        const tableIdFinal = this.getTableId(props);

        actionModuleItemInit(
          tableIdFinal,
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
          actionLoadRecords(tableIdFinal, undefined, undefined, false, true);
        } else {
          // если не загружаем, то вручную обновим урл
          this.updateUrl(initMeta, initFilters);
        }
      }
      componentWillReceiveProps(newProps) {
        const {
          initMeta,
          initFilters,
          // actionClearFilters,
          actionLoadRecords,
        } = newProps;

        const oldTableId = this.getTableId();
        const newTableId = this.getTableId(newProps);
        if (newTableId !== oldTableId) {
          this.componentWillUnmount(this.props);
          // this.componentWillMount(newProps);
        } else if (loadOnChange && actionLoadRecords) {
          actionLoadRecords(newTableId, initMeta, initFilters);
        }
      }
      componentWillUnmount(props = this.props) {
        const {
          actionModuleItemRemove,
        } = props;
        if (clearOnUnmount) {
          actionModuleItemRemove(this.getTableId(props));
        }
      }

      // ======================================================
      // UTILS
      // ======================================================
      getTableId(props = this.props) {
        return executeVariable(tableId, null, props);
      }

      updateUrl(meta, filters = undefined) {
        const {
          location,
          actionReplaceState,
        } = this.props;

        actionReplaceState({
          pathname: cutContextPath(location.pathname),
          search: updateLocationSearch(
            location.search,
            {
              ...meta,
              filters,
            },
            true, // assign = replace
          ),
        });
      }

      // ======================================================
      // HANDLERS
      // ======================================================
      @bind()
      handleUpdateTableMeta(newMeta, replace = false) {
        // делаем через обновления урла, так как есть случаи когда tableId зависит от меты и фильтров, а если сразу запустить actionLoadRecords c новыми фильтрами то tableId еще не поменяется ибо урл еще не поменялся
        return this.updateUrl(
          replace
            ? getMeta(newMeta)
            : newMeta,
        );
      }

      @bind()
      handleUpdateTableFilters(newFilters, replace = false) {
        const {
          table: {
            filters,
          },
        } = this.props;

        return this.updateUrl(
          undefined,
          replace
            ? newFilters
            : {
              ...filters,
              ...newFilters,
            },
        );
      }

      // ======================================================
      // MAIN RENDER
      // ======================================================
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

        return (
          <ReactComponentClass
            { ...this.props }
            onUpdateTableFilters={ this.handleUpdateTableFilters }
            onUpdateTableMeta={ this.handleUpdateTableMeta }
            tableId={ this.getTableId() }
            getTableId={ this.getTableId }
          />
        );
      }
    }

    return ReduxTableExtendedComponent;
  };
}
