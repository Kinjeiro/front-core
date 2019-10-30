/* eslint-disable no-unused-vars,consistent-return */
import React, { PureComponent } from 'react';
// import PropTypes from 'prop-types';
import bind from 'lodash-decorators/bind';
// import omit from 'lodash/omit';
// import pick from 'lodash/pick';
import debounce from 'lodash/debounce';
import memoizeOne from 'memoize-one';

import {
  deepEquals,
  emitProcessing,
  wrapToArray,
} from '../../../../../../../common/utils/common';
import getComponents from '../../../get-components';
// ======================================================
// MODULE
// ======================================================
import i18n from '../../../i18n';
import {
  createOptionMeta,
  createSimpleSelectRecord, isOptionMeta,
  RECORD_ID_FIELD,
  RECORD_LABEL_FIELD,
} from '../../../model-select-option';
import { SELECT_CORE_PROP_TYPES_MAP } from './Select.propTypes';

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
    records: [],
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

    if (searchOnceOnMinCharacters && searchMinCharacters === 0) {
      this.handleSearchInner(lastSearch, lastSearchMeta);
    }
  }

  componentDidUpdate(prevProps/* , prevState, snapshot */) {
    const {
      value,
    } = this.props;

    if (!deepEquals(wrapToArray(value), wrapToArray(prevProps.value))) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        selectedRecords: SelectCore.getSelectedRecords(this.props, true),
      });
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
      records,
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

    return searchTerm
      ? records.filter((record) => record[fieldLabel].indexOf(searchTerm) >= 0)
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

      let resultRecords = records;

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
      return resultRecords.map((record, index) => this.parseToOptionMeta(record, index, resultRecords, props));
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
      const {
        multiple,
      } = this.props;
      const visibleRecords = this.getFilteredOptionMetas();
      const valueOptionMeta = selectedRecords.map((selectedRecord, index) =>
        this.parseToOptionMeta(selectedRecord, index, visibleRecords));
      return multiple ? valueOptionMeta : valueOptionMeta[0];
    },
  );
  getValueOptionMeta() {
    const {
      selectedRecords,
    } = this.state;
    return this.getValueOptionMetaMemoize(selectedRecords, this.props);
  }
  findOptionMetaByControlValue(recordId) {
    return isOptionMeta(recordId)
      ? recordId
      : this.getFilteredOptionMetas().find((optionMeta) => optionMeta.recordId === recordId)
        || this.getValueOptionMeta().find((optionMeta) => optionMeta.recordId === recordId);
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
  updateSelect(currentRecordId, isRemove = false) {
    const {
      records,
      multiple,
      isSaveFullRecord,
      fieldLabel,
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

    const currentOptionMeta = this.findOptionMetaByControlValue(currentRecordId);

    const {
      record: currentRecord,
      recordId,
      index: currentRecordIndex,
    } = currentOptionMeta;

    const recordsFinal = multiple
      ? isRemove
        ? useUnique
          ? selectedRecords.filter((record) => record[fieldId] !== recordId)
          // убираем только первый по списку из подходящих
          : selectedRecords.filter((record, index) => index !== currentRecordIndex)
        : [
          ...selectedRecords,
          currentRecord,
        ]
      : currentRecord;

    this.setState({
      selectedRecords: wrapToArray(recordsFinal),
    });

    const valuesNew = isSaveFullRecord
      ? recordsFinal
      : multiple
        ? recordsFinal.map((recordItem) => recordItem[fieldId])
        : recordsFinal[fieldId];

    const valueSelected = isSaveFullRecord
      ? currentRecord
      : currentRecord[fieldId];


    // todo @ANKU @LOW @BUG_OUT - элемент при выборе показывает в input option.value а не children option
    // onSelect(value);

    return emitProcessing(
      Promise.all([
        !isRemove && onSelect        ? onSelect(valueSelected, recordsFinal)         : Promise.resolve(),
        isRemove && onRemoveSelected ? onRemoveSelected(valueSelected, recordsFinal) : Promise.resolve(),
        onChange ? onChange(valuesNew, recordsFinal) : Promise.resolve(),
        onFieldChange ? onFieldChange(valuesNew, recordsFinal) : Promise.resolve(),
      ]),
      this,
      'isProcessing',
    );
  }


  @bind()
  handleSelect(newRecordId) {
    return this.updateSelect(newRecordId);
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
  handleRemoveSelected(removeRecordId) {
    // todo @ANKU @LOW - сделать множественное удаление
    return this.updateSelect(
      Array.isArray(removeRecordId) ? removeRecordId[0] : removeRecordId,
      true,
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

    return this.updateSelect(
      createOptionMeta({
        record: newRecord,
        recordId: newRecord[fieldId],
        label: labelFinal,
        index,
      }),
      true,
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
        } else if (searchTermLength === 0) {
          return this.handleSearchInner('', meta);
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
        placeholder={ i18n('components.SelectCore.placeholder') }
        loading={ isProcessing }

        { ...this.getControlProps() }

        className={ `SelectCore ${isProcessing ? 'SelectCore--processing' : ''} ${className || ''}` }

        options={ undefined }
        optionMetas={ this.getFilteredOptionMetas() }
        value={ this.getControlValue() }
        valueOptionMeta={ this.getValueOptionMeta() }

        inputText={ renderInputText(selectedRecords, this.props) }
        searchTerm={ lastSearch }

        onChange={ undefined }
        onSelect={ this.handleSelect }
        onRemoveSelected={ this.handleRemoveSelected }
        onCreateNew={ this.handleCreateNew }
        onSearch={ this.handleSearch }
        onLoadMore={ onLoadMore && this.handleLoadMore }
      />
    );
  }
}
