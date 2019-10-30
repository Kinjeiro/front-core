/* eslint-disable no-unused-vars,consistent-return */
import React, { PureComponent } from 'react';
// import PropTypes from 'prop-types';
import bind from 'lodash-decorators/bind';
// import omit from 'lodash/omit';
// import pick from 'lodash/pick';
// import debounce from 'lodash/debounce';
import memoizeOne from 'memoize-one';

import {
  deepEquals,
  emitProcessing,
  executeVariable,
  wrapToArray,
} from '../../../../../../../common/utils/common';
import getComponents from '../../../get-components';
// ======================================================
// MODULE
// ======================================================
// import i18n from '../../../i18n';
import {
  createOptionMeta,
  createSimpleSelectRecord, isOptionMeta,
  RECORD_ID_FIELD,
  RECORD_LABEL_FIELD,
} from '../../../model-select-option';
import { CHECKBOX_CORE_PROP_TYPES_MAP } from './Checkbox.propTypes';

const {
  CheckboxView,
} = getComponents();

/**
 * Нужно показывать только n первых элементов
 */
export default class CheckboxCore extends PureComponent {
  static propTypes = CHECKBOX_CORE_PROP_TYPES_MAP;

  static defaultProps = {
    records: undefined,
    disabledOptions: [],
    fieldLabel: RECORD_LABEL_FIELD,
    fieldId: RECORD_ID_FIELD,
  };


  state = {
    selectedRecords: CheckboxCore.getSelectedRecords(this.props, true),
    isProcessing: false,
  };

  // ======================================================
  // LIFECYCLE
  // ======================================================
  componentDidUpdate(prevProps/* , prevState, snapshot */) {
    const {
      value,
    } = this.props;

    if (!deepEquals(wrapToArray(value), wrapToArray(prevProps.value))) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        selectedRecords: CheckboxCore.getSelectedRecords(this.props, true),
      });
    }
  }


  // ======================================================
  // STATIC
  // ======================================================
  static getRecords(props) {
    const {
      multiple,
      records,
      id,
      name,
      fieldId,
      fieldLabel,
      value,
      isSaveFullRecord,
    } = props;

    if (records) {
      return records;
    }

    if (value) {
      return wrapToArray(value)
        .map((valueItem) => (
          isSaveFullRecord
            ? valueItem
            // может не быть в текущих records выбранных значений (к примеру, при ajax search)
            : createSimpleSelectRecord(
              valueItem,
              valueItem,
              fieldId,
              fieldLabel,
            )));
    }

    return multiple
      ? []
      : [createSimpleSelectRecord(id || name, undefined, fieldId, fieldLabel)];
  }

  // todo @ANKU @LOW - это копипаст от SelectCore в будущем нужно их объединить
  static getSelectedRecords(props, useDefault) {
    const {
      value,
      defaultValue = null,
      fieldId,
      fieldLabel,
      isSaveFullRecord,
    } = props;

    const recordsFinal = CheckboxCore.getRecords(props);

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
        recordsFinal.find((record) => record[fieldId] == valueItem)
      ));
    }

    if (useDefault && defaultValue !== null && selectedRecords.length === 0) {
      selectedRecords = wrapToArray(defaultValue).map((defaultItem) => (
        isSaveFullRecord
          ? defaultItem
          // eslint-disable-next-line eqeqeq
          : recordsFinal.find((record) => record[fieldId] == defaultItem)
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

    optionMeta.label = executeVariable(
      renderOption,
      optionMeta.label,
      optionMeta.label,
      record,
      optionMeta,
      visibilityRecords,
    );

    return optionMeta;
  }

  getOptionMetasMemoize = memoizeOne(
    (selectedRecords, records, props) => {
      return CheckboxCore.getRecords(props)
        .map((record, index) => this.parseToOptionMeta(record, index, records, props));
    },
  );
  getOptionMetas() {
    const {
      multiple,
      records,
    } = this.props;
    const {
      selectedRecords,
    } = this.state;

    return this.getOptionMetasMemoize(
      selectedRecords,
      records,
      this.props,
    );
  }

  getValueOptionMetaMemoize = memoizeOne(
    (selectedRecords) => {
      const visibleRecords = this.getOptionMetas();
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
      : this.getOptionMetas().find((optionMeta) => optionMeta.recordId === recordId)
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
  updateCheck(currentRecordId, isCheck = false) {
    const {
      records,
      multiple,
      isSaveFullRecord,
      fieldId,

      onChange,
      onFieldChange,
    } = this.props;
    const {
      selectedRecords,
    } = this.state;

    let currentOptionMeta;
    let recordsFinal;

    // let valueSelected;
    if (currentRecordId) {
      currentOptionMeta = this.findOptionMetaByControlValue(currentRecordId);

      const {
        record: currentRecord,
        recordId,
        // index: currentRecordIndex,
      } = currentOptionMeta;

      recordsFinal = multiple
        ? isCheck
          // добавляем
          ? [...selectedRecords, currentRecord]
          // убираем
          : selectedRecords.filter((recordItem) => recordItem[fieldId] !== recordId)
        : isCheck
          ? currentRecord
          : null;

      // valueSelected = isSaveFullRecord
      //   ? currentRecord
      //   : currentRecord[fieldId];
    } else {
      // select \ deselect all
      recordsFinal = isCheck ? records : [];
    }

    this.setState({
      selectedRecords: wrapToArray(recordsFinal),
    });

    const valuesNew = isSaveFullRecord
      ? recordsFinal
      : multiple
        ? recordsFinal.map((recordItem) => recordItem[fieldId])
        : recordsFinal
          ? recordsFinal[fieldId]
          : null;

    const contextCheckbox = {
      optionMeta: currentOptionMeta,
    };

    return emitProcessing(
      Promise.all([
        onChange ? onChange(valuesNew, recordsFinal, contextCheckbox) : Promise.resolve(),
        onFieldChange ? onFieldChange(valuesNew, recordsFinal, contextCheckbox) : Promise.resolve(),
      ]),
      this,
      'isProcessing',
    );
  }


  @bind()
  handleChangeCheck(recordId, boolValue) {
    return this.updateCheck(recordId, boolValue);
  }
  @bind()
  handleCheckAll() {
    return this.updateCheck(null, true);
  }
  @bind()
  handleUncheckAll() {
    return this.updateCheck(null, false);
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
    } = this.props;
    const {
      isProcessing,
    } = this.state;

    return (
      <CheckboxView
        loading={ isProcessing }

        { ...this.getControlProps() }

        className={ `CheckboxCore ${isProcessing ? 'CheckboxCore--processing' : ''} ${className || ''}` }

        options={ undefined }
        optionMetas={ this.getOptionMetas() }
        value={ this.getControlValue() }
        valueOptionMetas={ this.getValueOptionMetas() }

        onChangeCheck={ this.handleChangeCheck }
        onCheckAll={ this.handleCheckAll }
        onUncheckAll={ this.handleUncheckAll }
      />
    );
  }
}
