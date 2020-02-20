/* eslint-disable no-unused-vars,consistent-return */
import React, {PureComponent} from 'react';
// import PropTypes from 'prop-types';
import bind from 'lodash-decorators/bind';
// import omit from 'lodash/omit';
// import pick from 'lodash/pick';
import debounce from 'lodash/debounce';
import memoizeOne from 'memoize-one';

import {deepEquals, difference, emitProcessing, wrapToArray,} from '../../../../../../../common/utils/common';
import getComponents from '../../../get-components';
// ======================================================
// MODULE
// ======================================================
import i18n from '../../../i18n';
import {
  createOptionMeta,
  createSimpleSelectRecord,
  isOptionMeta,
  RECORD_ID_FIELD,
  RECORD_LABEL_FIELD,
} from '../../../model-select-option';
import {SELECT_CORE_PROP_TYPES_MAP} from './Select.propTypes';

const {
  SelectView,
  // BaseOption,
} = getComponents();

require('./SelectCore.css');

/**
 * Нужно показывать только n первых элементов
 */
export default class SelectCore extends PureComponent {
  static propTypes = SELECT_CORE_PROP_TYPES_MAP;

  static defaultProps = {
    records: undefined,
    disabledOptions: [],
    // maxVisible: 30,
    maxVisible: 100,
    fieldLabel: RECORD_LABEL_FIELD,
    fieldId: RECORD_ID_FIELD,
    useSearch: true,
    useUnique: true,
    isHideSelected: true,
    searchDebounce: 500,
    searchMinCharacters: 0,
    renderInputText: (selectedRecords, props) => selectedRecords.map((record) => record[props.fieldLabel]).join(','),
  };

  state = {
    lastSearch: '',
    lastSearchMeta: {},
    selectedRecords: SelectCore.getSelectedRecords(this.props, true),
    isProcessing: false,
  };

  // ======================================================
  // LIFECYCLE
  // ======================================================
  constructor(...args) {
    super(...args);

    const {
      searchDebounce,
    } = this.props;

    if (searchDebounce) {
      this.handleSearchInner = debounce(this.handleSearchInner, searchDebounce);
    }
  }

  componentDidMount() {
    const {
      searchOnceOnMinCharacters,
      searchMinCharacters,
    } = this.props;

    const {
      lastSearch,
      lastSearchMeta,
    } = this.state;

    // if (searchOnceOnMinCharacters && searchMinCharacters === 0) {
    if (searchMinCharacters === 0) {
      this.handleSearchInner(lastSearch, lastSearchMeta);
    }

    this.checkOutOfRecordsRange();
  }

  componentDidUpdate(prevProps/* , prevState, snapshot */) {
    const {
      value,
      defaultValue,
      records,
    } = this.props;

    const isRecordsChanged = !deepEquals(records, prevProps.records);
    if (isRecordsChanged && this.checkOutOfRecordsRange()) {
      return; // дальше не нужно продолжать, ибо внутри уже будет set selectedRecords и вызывается реакция изменения и новые значения придут сверху
    }

    if (
      !deepEquals(wrapToArray(value), wrapToArray(prevProps.value)) // обновили значения
      || isRecordsChanged // пришли новые рекорды - нужно обновить вдруг labels уже подтянулись
      || !deepEquals(defaultValue, prevProps.defaultValue)
    ) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        selectedRecords: SelectCore.getSelectedRecords(this.props, true),
      });
    }
  }

  checkOutOfRecordsRange() {
    const {
      value,
      records,
      isSaveFullRecord,
      isValueOnlyIntoRecords,
      fieldId,
    } = this.props;

    if (!isValueOnlyIntoRecords || typeof records === 'undefined') {
      return false;
    }

    const valueIds = isSaveFullRecord
      ? wrapToArray(value).map((valueRecord) => valueRecord[fieldId])
      : wrapToArray(value);

    const valuesIdsIntoRecords = wrapToArray(records)
      .filter((record) => valueIds.includes(record[fieldId]))
      .map((valueRecord) => valueRecord[fieldId]);

    // если изменили рекорды и из-за этого убрались некоторые элементы (это частный кейс, когда один селект зависит от другого (к примеру, изменили федеральный округ - должны сбросятся регионы)
    // нужно запустить сигнал что они удалились и больше не показывались
    const valuesRemoved = difference(value, valuesIdsIntoRecords);
    if (valuesRemoved.length > 0) {
      this.updateMultiple(valuesRemoved, true);
      return true;
    }
  }

  // static getDerivedStateFromProps(props, state) {
  //   return {
  //     ...state,
  //     visibleOptions: SelectCore.filterOptionMetas(props, state.lastSearch),
  //   };
  // }

  // ======================================================
  // STATIC
  // ======================================================
  static getSelectedRecords(props, useDefault) {
    const {
      multiple,
      records = [],
      value,
      defaultValue = null,
      // selectedValue,
      fieldId,
      fieldLabel,
      isSaveFullRecord,
    } = props;

    let selectedRecords;
    if (!value || (Array.isArray(value) && value.length === 0)) {
      selectedRecords = [];
    } else if (isSaveFullRecord) {
      selectedRecords = wrapToArray(value);
    } else {
      // вариант когда значениея не объект
      // noinspection EqualityComparisonWithCoercionJS
      selectedRecords = wrapToArray(value).map((valueItem) => (
        // eslint-disable-next-line eqeqeq
        records.find((record) => record[fieldId] == valueItem)
        // может не быть в текущих records выбранных значений (к примеру, при ajax search)
        || createSimpleSelectRecord(
          valueItem,
          valueItem,
          fieldId,
          fieldLabel,
        )
      ));
    }

    if (useDefault && defaultValue !== null && selectedRecords.length === 0) {
      selectedRecords = wrapToArray(defaultValue).map((defaultItem) => (
        typeof defaultItem === 'object'
          ? defaultItem
          // eslint-disable-next-line eqeqeq
          : records.find((record) => record[fieldId] == defaultItem)
          // может не быть в текущих records выбранных значений (к примеру, при ajax search)
          || createSimpleSelectRecord(
            defaultItem,
            defaultItem,
            fieldId,
            fieldLabel,
          )
      ));
    }

    return selectedRecords;
  }

  // ======================================================
  // UTILS
  // ======================================================
  searchFunc(records, searchTerm, props = this.props) {
    const {
      fieldLabel,
    } = props;

    const searchTermLower = searchTerm.toLowerCase();

    return searchTerm
      ? records.filter((record) => `${record[fieldLabel] || ''}`.toLowerCase().indexOf(searchTermLower) >= 0)
      : records;
  }

  parseToOptionMeta(record, index, visibilityRecords) {
    const {
      fieldLabel,
      fieldId,
      renderOption,
      disabledOptions,
    } = this.props;
    const {
      [fieldLabel]: label,
      [fieldId]: recordId,
    } = record;

    const optionMeta = createOptionMeta({
      record,
      recordId,
      label,
      index,
      isDisabled: disabledOptions.includes(recordId),
      isSelected: this.isSelected(recordId),
    });

    optionMeta.label = renderOption
      ? renderOption(optionMeta.label, record, optionMeta, visibilityRecords)
      : optionMeta.label;

    return optionMeta;

    // взято за основу ANTDSelect.Option
    // return (
    //   <BaseOption
    //     key={ value }
    //     optionValue={ `${value}` }
    //     value={ `${label}` }
    //     title={ label }
    //     disabled={ disabled }
    //   >
    //     { label === null ? value : label }
    //   </BaseOption>
    // );
  }

  filterOptionMetas = memoizeOne(
    (uniqueRecords, lastSearch = '', records, props = this.props) => {
      const {
        maxVisible,
        onSearch,
        fieldId,
        searchMinCharacters,
        searchOnceOnMinCharacters,
        isHideSelected,
      } = props;

      if (lastSearch.length < searchMinCharacters) {
        return [];
      }

      let resultRecords = wrapToArray(records);

      if (!onSearch) {
        // кастомный внутренний серч, в противном случае поиск должен делаться в onSearch
        resultRecords = this.searchFunc(resultRecords, lastSearch, props);
      }
      if (uniqueRecords && isHideSelected) {
        const ids = uniqueRecords.map((record) => record[fieldId]);
        resultRecords = resultRecords.filter((record) => !ids.includes(record[fieldId]));
      }
      if (!searchOnceOnMinCharacters && maxVisible && resultRecords.length > maxVisible) {
        resultRecords = resultRecords.slice(0, maxVisible);
      }
      return resultRecords.map((record, index) =>
        this.parseToOptionMeta(record, index, resultRecords, props));
    },
  );

  getFilteredOptionMetas() {
    const {
      multiple,
      records,
      useUnique,
    } = this.props;
    const {
      selectedRecords,
      lastSearch,
    } = this.state;

    return this.filterOptionMetas(
      useUnique && multiple ? selectedRecords : null,
      lastSearch,
      records,
      this.props,
    );
  }

  getValueOptionMetaMemoize = memoizeOne(
    (selectedRecords) => {
      const visibleRecords = this.getFilteredOptionMetas();
      return selectedRecords.map((selectedRecord, index) =>
        this.parseToOptionMeta(selectedRecord, index, visibleRecords));
    },
  );

  getValueOptionMetas() {
    const {
      selectedRecords,
    } = this.state;
    return this.getValueOptionMetaMemoize(selectedRecords, this.props);
  }

  findOptionMetaByControlValue(recordId) {
    return isOptionMeta(recordId)
      ? recordId
      : this.getFilteredOptionMetas().find((optionMeta) => optionMeta.recordId === recordId)
      || this.getValueOptionMetas().find((optionMeta) => optionMeta.recordId === recordId);
  }

  getControlValue() {
    const {
      multiple,
      fieldId,
    } = this.props;
    const {
      selectedRecords,
    } = this.state;

    const result = selectedRecords.map((record) => record[fieldId]);
    return multiple ? result : result[0];
  }

  isSelected(recordId) {
    const {
      multiple,
    } = this.props;
    const currentValue = this.getControlValue();
    return multiple
      ? wrapToArray(currentValue).includes(recordId)
      : currentValue === recordId;
  }


  // ======================================================
  // HANDLERS
  // ======================================================
  /**
   *
   * @param currentItemIds - может быть как id так и просто optionMeta (если это createNew)
   * @param isRemove
   * @param removedItemIndexes
   * @return {*}
   */
  updateMultiple(
    currentItemIds,
    isRemove = false,
    removedItemIndexes = undefined,
  ) {
    const {
      multiple,
      isSaveFullRecord,
      fieldId,
      useUnique,

      onSelect,
      onRemoveSelected,
      onChange,
      onFieldChange,
    } = this.props;
    const {
      selectedRecords,
    } = this.state;

    const currentRecords = [];
    const currentRecordIds = [];
    const currentOptionsMetas = wrapToArray(currentItemIds).reduce((res, currentItem) => {
      const optionMeta = this.findOptionMetaByControlValue(currentItem);
      if (optionMeta) {
        currentRecords.push(optionMeta.record);
        currentRecordIds.push(optionMeta.recordId);
        res.push(optionMeta);
      }
      return res;
    }, []);

    const removedItemIndexesFinal = typeof removedItemIndexes !== 'undefined'
      ? wrapToArray(removedItemIndexes)
      : currentOptionsMetas.map(({index}) => index);

    const selectedRecordsNew = multiple
      ? isRemove
        ? useUnique
          ? selectedRecords.filter((record) => !currentRecordIds.includes(record[fieldId]))
          // убираем только первый по списку из подходящих
          : selectedRecords.filter((record, index) => !removedItemIndexesFinal.includes(index))
        : [
          ...selectedRecords,
          ...currentRecords,
        ]
      : currentRecords;

    this.setState({
      selectedRecords: selectedRecordsNew,
    });

    const valueNew = multiple
      ? isSaveFullRecord
        ? selectedRecordsNew
        : selectedRecordsNew.map((recordItem) => recordItem[fieldId])
      : isSaveFullRecord
        ? selectedRecordsNew[0]
        : selectedRecordsNew[0] && selectedRecordsNew[0][fieldId];

    const currentValue = multiple
      ? isSaveFullRecord
        ? currentRecords
        : currentRecords.map((currentRecord) => currentRecord[fieldId])
      : isSaveFullRecord
        ? currentRecords[0]
        : currentRecords[0] && currentRecords[0][fieldId];


    // todo @ANKU @LOW @BUG_OUT - элемент при выборе показывает в input option.value а не children option
    // onSelect(value);

    const context = {
      optionMeta: multiple
        ? currentOptionsMetas
        : currentOptionsMetas[0],
    };

    return emitProcessing(
      Promise.all([
        !isRemove && onSelect ? onSelect(currentValue, selectedRecordsNew) : Promise.resolve(),
        isRemove && onRemoveSelected ? onRemoveSelected(currentValue, selectedRecordsNew, removedItemIndexes) : Promise.resolve(),
        onChange ? onChange(valueNew, selectedRecordsNew, context) : Promise.resolve(),
        onFieldChange ? onFieldChange(valueNew, selectedRecordsNew, context) : Promise.resolve(),
      ]),
      this,
      'isProcessing',
    );
  }

  @bind()
  handleSelect(newRecordId) {
    return this.updateMultiple(newRecordId);
    //
    // if (typeof selectViewControl === 'object') {
    //   const {
    //     value,
    //     options,
    //     props: selectViewControlProps,
    //   } = selectViewControl;
    //
    //   if (selectViewControl.value) {
    //     // бывает что нужно проставлять не id а полные толстенькие изначальные рекорды
    //     const currentOptions = options.find(({ [ATTR_OPTION_VIEW__VALUE]: optionValue }) => value === optionValue);
    //     const {
    //       [ATTR_OPTION_VIEW__FULL_RECORD]: optionRecord,
    //     } = options.find(({ value }) => selectViewControl.value === value) || {};
    //     // semantic format
    //     return this.updateSelect(
    //       selectViewControl.value,
    //       undefined,
    //       selectViewControl,
    //       contextSelect,
    //       optionRecord,
    //     );
    //   }
    //
    //   // antd select format
    //   // todo @ANKU @LOW @BUG_OUT @antd - элемент при выборе показывает в input option.value а не children option
    //   return this.updateSelect(
    //     selectViewControlProps && selectViewControlProps.optionValue,
    //     label,
    //     selectViewControl,
    //     contextSelect,
    //     null,
    //   );
    // }
    // if (label.target) {
    //   // event
    //   return this.updateSelect(
    //     label.target.value,
    //     undefined,
    //     selectViewControl,
    //     contextSelect,
    //     null,
    //   );
    // }
    // throw new Error('Unknown handleSelect format');
  }

  @bind()
  handleRemoveSelected(removeRecordId, newRecordsFinal = undefined, removedItemIndex = undefined) {
    return this.updateMultiple(
      removeRecordId,
      true,
      removedItemIndex,
    );
  }

  @bind()
  async handleCreateNew(label, id) {
    const {
      parseNewItem,
      fieldLabel,
      fieldId,
      renderOption,
      onCreateNew,
    } = this.props;
    const {
      selectedRecords,
    } = this.state;

    const index = selectedRecords.length + 1;

    const newRecord = parseNewItem
      ? parseNewItem(label, id, index)
      : createSimpleSelectRecord(id || label, label, fieldId, fieldLabel);

    const labelFinal = renderOption
      ? renderOption(newRecord[fieldLabel], newRecord, index, this.getFilteredOptionMetas())
      : newRecord[fieldLabel];

    await emitProcessing(
      onCreateNew(newRecord, index),
      this,
      'isProcessing',
    );

    return this.updateMultiple(
      createOptionMeta({
        record: newRecord,
        recordId: newRecord[fieldId],
        label: labelFinal,
        index,
      }),
    );
  }

  @bind()
  handleSearchInner(searchTerm, meta) {
    const {
      onSearch,
    } = this.props;

    return onSearch && emitProcessing(
      onSearch(searchTerm, meta),
      this,
      'isProcessing',
    );
  }

  @bind()
  handleSearch(searchTerm, meta, force = false) {
    const {
      onSearch,
      searchMinCharacters,
      searchOnceOnMinCharacters,
    } = this.props;
    const {
      lastSearch,
      lastSearchMeta,
    } = this.state;

    const isMetaChanges = !deepEquals(lastSearchMeta || {}, meta || {});
    if (force || lastSearch !== searchTerm || isMetaChanges) {
      this.setState({
        lastSearch: searchTerm || '',
        lastSearchMeta: meta,
      });

      if (onSearch) {
        if (isMetaChanges) {
          return this.handleSearchInner(searchTerm, meta);
        }

        const searchTermLength = (searchTerm || '').length;

        if (searchOnceOnMinCharacters) {
          if (
            // на границе БОЛЬШЕ - загружаем
            searchMinCharacters > 0 // если 0 то мы уже загрузили при didMount
            && searchTermLength >= searchMinCharacters
            && lastSearch.length < searchMinCharacters
          ) {
            return this.handleSearchInner(searchTerm, meta);
          }
          // } else if (
          //   searchTermLength < searchMinCharacters
          //   && lastSearch.length >= searchMinCharacters
          // ) {
          //   // todo @ANKU @LOW -
          //   // на границе МЕНЬШЕ
          //   return this.handleSearchInner('', meta);


          // } else if (searchTermLength === 0) {
          //   return this.handleSearchInner('', meta);
        } else if (searchTermLength >= searchMinCharacters) {
          // default
          return this.handleSearchInner(searchTerm, meta);
        }
      }
      // if (searchTerm === '' && selectedLabel) {
      //   // если очистили значение (нажав на clear)
      //   return this.updateSelect(null);
      // }
    }
  }

  @bind()
  handleLoadMore() {
    const {
      onLoadMore,
    } = this.props;
    const {
      lastSearch,
    } = this.state;

    if (onLoadMore) {
      return onLoadMore(
        lastSearch,
        this.getFilteredOptionMetas().length,
      );
    }
  }

  @bind()
  handleBlur(...args) {
    const {
      onBlur,
    } = this.props;

    if (onBlur) {
      onBlur(...args);
    }

    this.setState({
      lastSearch: '',
    });
  }

  // ======================================================
  // RENDERS
  // ======================================================
  getControlProps() {
    // return omit(this.props, SelectCore.CUSTOM_FIELDS);
    return this.props;
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      className,
      onLoadMore,
      fieldLabel,
      renderInputText,
      isProcessing: isProcessingFromProps,
    } = this.props;
    const {
      lastSearch,
      selectedRecords,
      isProcessing,
    } = this.state;

    /*
      // взято за основу ANTDSelect
      mode="combobox"
      search={ true }
      showSearch={ true }
      allowClear={ true }
    */
    return (
      <SelectView
        placeholder={i18n('components.SelectCore.placeholder')}
        isProcessing={isProcessingFromProps || isProcessing}
        loading={isProcessingFromProps || isProcessing}

        {...this.getControlProps()}

        className={`SelectCore ${isProcessing ? 'SelectCore--processing' : ''} ${className || ''}`}

        options={undefined}
        optionMetas={this.getFilteredOptionMetas()}
        value={this.getControlValue()}
        valueOptionMetas={this.getValueOptionMetas()}

        inputText={renderInputText(selectedRecords, this.props)}
        searchTerm={lastSearch}

        onChange={undefined}
        onSelect={this.handleSelect}
        onRemoveSelected={this.handleRemoveSelected}
        onCreateNew={this.handleCreateNew}
        onSearch={this.handleSearch}
        onLoadMore={onLoadMore && this.handleLoadMore}
        onBlur={this.handleBlur}
      />
    );
  }
}
