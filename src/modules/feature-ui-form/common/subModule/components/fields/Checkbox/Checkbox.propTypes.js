// import omit from 'lodash/omit';
import PropTypes from 'prop-types';
import React from 'react';

import ID_PROP_TYPE from '../../../../../../../common/models/model-id';

import { FIELD_PROP_TYPE_MAP } from '../../../model-field';
import SELECT_OPTION_META_PROP_TYPE from '../../../model-select-option';

export const CHECKBOX_CORE_PROP_TYPES_MAP = {
  ...FIELD_PROP_TYPE_MAP,

  // ======================================================
  // DATA
  // ======================================================
  value: PropTypes.any,
  defaultValue: PropTypes.any,
  /**
   * @deprecated - use value
   */
  selectedValue: PropTypes.any,
  /**
   * Самый важный текущий список данных к отображения для выбора (мы работаем с данными, а потом они переводятся в optionMeta а в SelectView они преобразуются уже в option node
   */
  records: PropTypes.array,
  /**
   * по-умолчанию сохраняется только id, но если эта true - сохранится весь объект
   */
  isSaveFullRecord: PropTypes.bool,
  fieldLabel: PropTypes.string,
  fieldId: PropTypes.string,

  /**
   * Внутренний метод от CoreField чтобы можно было задать кастомный onChange
   *
   * (valuesOrNull, selectedRecords, context) => {}
   * - context - { optionMeta: { record, recordId, isSelected, isDisabled } }
   * - если multiple - это массивы, если нет - значения (если не выделено - null)
   * - если isSaveFullRecord - то newValuesFinal - это рекорд, если нет то id
   */
  onFieldChange: PropTypes.func,
  /**
   * (valuesOrNull, selectedRecords, context) => {}
   * - context - { optionMeta: { record, recordId, isSelected, isDisabled } }
   * - если multiple - это массивы, если нет - значения (если не выделено - null)
   * - если isSaveFullRecord - то newValuesFinal - это рекорд, если нет то id
   */
  onChange: PropTypes.func,


  // ======================================================
  // VISIBILITY
  // ======================================================
  className: PropTypes.string,
  /**
   * (record[fieldLabel], record, index, visibilityRecords) => React.node
   */
  renderOption: PropTypes.func,
  disabledOptions: PropTypes.arrayOf(ID_PROP_TYPE),


  // ======================================================
  // MULTIPLE
  // ======================================================
  multiple: PropTypes.bool,
};


const CHECKBOX_VIEW_PROP_TYPES_MAP = {
  ...CHECKBOX_CORE_PROP_TYPES_MAP,


  // placeholder: PropTypes.node,
  loading: PropTypes.bool,

  className: PropTypes.string,

  // options: PropTypes.array,
  optionMetas: PropTypes.arrayOf(SELECT_OPTION_META_PROP_TYPE),
  value: PropTypes.any,
  valueOptionMetas: PropTypes.oneOfType([
    SELECT_OPTION_META_PROP_TYPE,
    PropTypes.arrayOf(SELECT_OPTION_META_PROP_TYPE),
  ]),

  /**
   * (recordId, isCheck) => {}
   */
  onChangeCheck: PropTypes.func,
  onCheckAll: PropTypes.func,
  onUncheckAll: PropTypes.func,
};

export default CHECKBOX_VIEW_PROP_TYPES_MAP;
