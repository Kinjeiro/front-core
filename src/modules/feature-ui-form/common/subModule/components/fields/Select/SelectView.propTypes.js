import omit from 'lodash/omit';
import PropTypes from 'prop-types';

import ID_PROP_TYPE from '../../../../../../../common/models/model-id';

import { FIELD_PROP_TYPE_MAP } from '../../../model-field';
import SELECT_OPTION_META_PROP_TYPE from '../../../model-select-option';

// export const FIELD_PROP_TYPES_MAP = {
//   isProcessing
//   errors
//   disabled
//   onBlur
//   onChange
//   onFieldChange
//   onTouch
//   renderLabel
//   selectedValue
//   subType
// };

export const SELECT_CORE_PROP_TYPES_MAP = {
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
  fieldValue: PropTypes.string,

  /**
   * Внутренний метод от CoreField чтобы можно было задать кастомный onChange
   *
   * (newValuesFinal, newRecordsFinal) => {}
   * - если multiple - это массивы, если нет - значения
   * - если isSaveFullRecord - то newValuesFinal - это рекорд, если нет то id
   */
  onFieldChange: PropTypes.func,
  /**
   * (newValuesFinal, newRecordsFinal) => {}
   * - если multiple - это массивы, если нет - значения
   * - если isSaveFullRecord - то newValuesFinal - это рекорд, если нет то id
   */
  onChange: PropTypes.func,
  /**
   * (newSelectedValue, newRecordsFinal) => {}
   * - если multiple - это массивы, если нет - значения
   * - если isSaveFullRecord - то newSelectedValue - это рекорд, если нет то id
   */
  onSelect: PropTypes.func,

  /**
   * Добавление новых сущностей
   */
  allowCreateNew: PropTypes.bool,
  /**
   * (label, id, index) => new record
   */
  parseNewItem: PropTypes.func,
  /**
   * (record, index) => {}
   */
  onCreateNew: PropTypes.func,


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
  /**
   * только уникальные значения могут быть выбраны
   */
  useUnique: PropTypes.bool,

  /**
   * (deletedValue, newRecordsFinal) => {}
   * - если multiple - это массивы, если нет - значения
   * - если isSaveFullRecord - то deletedValue - это рекорд, если нет то id
   */
  onRemoveSelected: PropTypes.func,

  // ======================================================
  // AJAX LOAD
  // ======================================================
  maxVisible: PropTypes.number,

  /**
   * использовать поиск для выбора
   */
  useSearch: PropTypes.bool,
  /**
   * (searchTerm) => {}
   * - если асинхронно нужно
   */
  onSearch: PropTypes.func,
  searchDebounce: PropTypes.number,
  searchMinCharacters: PropTypes.number,
  /**
   * если включаем - то игнорируется maxVisible
   * и ищет один раз а остальные уточняющие буквы фильтруют текущее значение и так будет пока не дойдет до минимального кол-ва символов и снова ищет
   * - если searchMinCharacters = 0 - то один раз при маунте будет
   * - если searchMinCharacters > 0 - будет дергаться onSearch каждый раз при пересечении этой границы
   */
  searchOnceOnMinCharacters: PropTypes.bool,

  /**
   * (searchTerm, alreadyShownLength) => {}
   */
  onLoadMore: PropTypes.func,
};


const SELECT_VIEW_PROP_TYPES_MAP = {
  ...SELECT_CORE_PROP_TYPES_MAP,
  // ...omit(SELECT_CORE_PROP_TYPES_MAP, [
  //   'options',
  //   'onChange',
  //   'onFieldChange',
  //   'selectedValue',
  // ]),

  placeholder: PropTypes.node,
  loading: PropTypes.bool,

  className: PropTypes.string,

  // options: PropTypes.array,
  optionMetas: PropTypes.arrayOf(SELECT_OPTION_META_PROP_TYPE),
  value: PropTypes.any,
  valueOptionMeta: PropTypes.oneOfType([
    SELECT_OPTION_META_PROP_TYPE,
    PropTypes.arrayOf(SELECT_OPTION_META_PROP_TYPE),
  ]),

  text: PropTypes.string,
  searchTerm: PropTypes.string,

  // onChange={ undefined }
  onSelect: PropTypes.func,
  onRemoveSelected: PropTypes.func,
  onSearch: PropTypes.func,
  onLoadMore: PropTypes.func,
};

export default SELECT_VIEW_PROP_TYPES_MAP;
