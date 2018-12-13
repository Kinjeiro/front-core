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
  generateUuid,
  executeVariable,
} from '../../common';
import {
  parseUrlParameters,
  updateLocationSearch,
} from '../../uri-utils';
import { cutContextPath } from '../../../helpers/app-urls';
import clientLogger from '../../../helpers/client-logger';

import {
  getMeta,
  TABLE_PROP_TYPE,
  META_PROP,
} from '../../../models/model-table';

import { getTableInfo } from '../../../app-redux/selectors';
import * as reduxTables from '../../../app-redux/reducers/app/redux-tables';

import getComponents from '../../../get-components';

// используется Loading
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
 * @param urlFilterValueNormalizers - мапа <filterName>: (urlValue)=>normalizedValue  - для правильного парсинга из урла значений
 * @param syncWithUrlParameters - синхронизировать с url query (но делается scroll to top и не подходит для load more и нескольких таблиц на странице)
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
  tableId = generateUuid(),
  {
    loadOnMount = true,
    loadOnChange = true,
    clearOnUnmount = true,
    initMeta = {},
    initFilters = {},
    tableActions,
    useLoading = true,
    urlFilterValueNormalizers,
    syncWithUrlParameters = true,
  } = {},
) {
  return (ReactComponentClass) => {
    @connect(
      (globalState, props) => {
        let query;
        if (syncWithUrlParameters) {
          const filterNormalizers = urlFilterValueNormalizers
            ? Object.keys(urlFilterValueNormalizers).reduce((result, filterParamName) => {
              // eslint-disable-next-line no-param-reassign
              result[`filters.${filterParamName}`] = urlFilterValueNormalizers[filterParamName];
              return result;
            }, {})
            : undefined;
          query = parseUrlParameters(props.location.search, filterNormalizers);
        }

        const tableIdFinal = executeVariable(tableId, null, props);
        const table = getTableInfo(globalState, tableIdFinal);

        const projectInitMeta = executeVariable(initMeta, {}, props);
        const projectInitFilters = executeVariable(initFilters, {}, props);

        return {
          syncWithUrlParameters,
          table,
          initMeta: getMeta(query, projectInitMeta),
          initFilters: query ? merge({}, projectInitFilters, query.filters) : projectInitFilters,
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
        syncWithUrlParameters: PropTypes.bool,

        actionModuleItemInit: PropTypes.func,
        actionModuleItemRemove: PropTypes.func,
        actionClearFilters: PropTypes.func,
        actionLoadRecords: PropTypes.func,

        location: PropTypes.object,
        actionPushState: PropTypes.func,
        actionReplaceState: PropTypes.func,
      };

      /*
        @NOTE: в React v16 componentWillUnmount стал асинхронным, то есть теперь он может сработать после того как замаунтится новый компонент
        То есть своим уникальным id стереть значения для нового
        Поэтому нужно вместо componentWillMount (который в 16 deprecated) использовать componentDidMount
        https://github.com/facebook/react/issues/11106
      */
      // componentWillMount(props = this.props) {
      componentDidMount(props = this.props) {
        const {
          initMeta,
          initFilters,
          actionModuleItemInit,
          actionLoadRecords,
          syncWithUrlParameters,
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
          actionLoadRecords(tableIdFinal, undefined, undefined, false, true, syncWithUrlParameters);
        } else if (syncWithUrlParameters) {
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
          syncWithUrlParameters,
          table: {
            actionLoadRecordsStatus,
          } = {},
        } = newProps;

        const isFailed = actionLoadRecordsStatus
          && actionLoadRecordsStatus.isFailed
          && !this.props.table.actionLoadRecordsStatus.isFailed;
        const oldTableId = this.getTableId();
        const newTableId = this.getTableId(newProps);
        if (newTableId !== oldTableId) {
          this.componentWillUnmount(this.props);
          // this.componentWillMount(newProps);
        } else if (
          !isFailed
          && loadOnChange
          && actionLoadRecords
          && syncWithUrlParameters
        ) {
          // если обновился урл (через updateUrl) - нужно обновиться загрузку
          actionLoadRecords(newTableId, initMeta, initFilters, false, false, syncWithUrlParameters);
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

      updateUrl(meta, newFilters = undefined) {
        const {
          location,
          actionReplaceState,
          table: {
            filters,
          },
        } = this.props;

        actionReplaceState({
          pathname: cutContextPath(location.pathname),
          search: updateLocationSearch(
            location.search,
            {
              ...meta,
              filters: typeof newFilters === 'undefined' ? filters : newFilters,
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
        const {
          actionLoadRecords,
          syncWithUrlParameters,
        } = this.props;

        const newMetaFinal = replace
          ? getMeta(newMeta)
          : newMeta;

        if (syncWithUrlParameters) {
          // делаем через обновления урла, так как есть случаи когда tableId зависит от меты и фильтров, а если сразу запустить actionLoadRecords c новыми фильтрами то tableId еще не поменяется ибо урл еще не поменялся
          return this.updateUrl(newMetaFinal);
        }
        return actionLoadRecords(this.getTableId(), newMetaFinal);
      }

      @bind()
      handleUpdateTableFilters(newFilters, replace = false) {
        const {
          table: {
            filters,
          },
          syncWithUrlParameters,
          actionLoadRecords,
        } = this.props;

        const newFiltersFinal = replace
          ? newFilters
          : {
            ...filters,
            ...newFilters,
          };

        if (syncWithUrlParameters) {
          return this.updateUrl(undefined, newFiltersFinal);
        }

        return actionLoadRecords(this.getTableId(), undefined, newFiltersFinal);
      }

      @bind()
      handleWrapActionLoadRecords(...args) {
        // eslint-disable-next-line max-len
        clientLogger.error('@deprecated: Use "onUpdateTableFilters" or "onUpdateTableMeta" instead of "actionLoadRecords"');
        return this.props.actionLoadRecords(...args);
      }
      @bind()
      handleWrapActionClearFilters(...args) {
        clientLogger.error('@deprecated: Use "onUpdateTableFilters" instead of "actionClearFilters"');
        return this.props.actionClearFilters(...args);
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

        // убираем, ибо нужно использовать onUpdateTableFilters и onUpdateTableMeta вместо. Так чтобы не учитывать там всегда флаг синхронизации с урл параметрами
        return (
          <ReactComponentClass
            { ...this.props }

            tableId={ this.getTableId() }
            getTableId={ this.getTableId }

            actionLoadRecords={ this.handleWrapActionLoadRecords }
            actionClearFilters={ this.handleWrapActionClearFilters }
            onUpdateTableFilters={ this.handleUpdateTableFilters }
            onUpdateTableMeta={ this.handleUpdateTableMeta }
          />
        );
      }
    }

    return ReduxTableExtendedComponent;
  };
}
