/* eslint-disable no-unused-vars */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import bind from 'lodash-decorators/bind';
import omit from 'lodash/omit';
// import pick from 'lodash/pick';
import memoizeOne from 'memoize-one';

import {
  emitProcessing,
} from '../../../../../../../common/utils/common';

// ======================================================
// MODULE
// ======================================================
import i18n from '../../../i18n';
import getComponents from '../../../get-components';

const {
  BaseSelect,
  // BaseOption,
} = getComponents();

require('./CoreSelect.css');

/*
React does not recognize the `optionRecord` prop on a DOM element
If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `optionrecord` instead.
If you accidentally passed it from a parent component, remove it from the DOM element.
*/
// export const ATTR_FULL_RECORD = 'optionRecord';
export const ATTR_FULL_RECORD = 'optionrecord';

/**
 * Нужно показывать только n первых элементов
 */
export default class CoreSelect extends PureComponent {
  static CUSTOM_FIELDS = [
    'selectedValue',
    'isSaveFullRecord',
    'fieldLabel',
    'fieldValue',
    'maxVisible',
    'onSelect',
    'onSearch',
  ];
  static propTypes = {
    value: PropTypes.any,
    /**
     * @deprecated - use value
     */
    selectedValue: PropTypes.any,
    // options: PropTypes.arrayOf(PropTypes.shape({
    //   value: PropTypes.oneOfType([
    //     PropTypes.string,
    //     PropTypes.number,
    //   ]).isRequired,
    //   label: PropTypes.string,
    //   disabled: PropTypes.bool,
    // })),
    options: PropTypes.array,

    /**
     * по-умолчанию сохраняется только id, но если эта true - сохранится весь объект
     */
    isSaveFullRecord: PropTypes.bool,
    fieldLabel: PropTypes.string,
    fieldValue: PropTypes.string,
    maxVisible: PropTypes.number,

    /**
     * (value, optionNode, contextSelect, optionRecord) => {}
     */
    onSelect: PropTypes.func,

    /**
     * (searchTerm) => {}
     * - если асинхронно нужно
     */
    onSearch: PropTypes.func,
  };

  static defaultProps = {
    options: [],
    // maxVisible: 30,
    maxVisible: 100,
    fieldLabel: 'label',
    fieldValue: 'value',
  };

  state = {
    // visibleOptions: this.filterOptions(),
    lastSearch: null,
    selectedLabel: CoreSelect.getSelectedOptionLabel(this.props),
    isProcessing: false,
  };

  // ======================================================
  // LIFECYCLE
  // ======================================================
  // static getDerivedStateFromProps(props, state) {
  //   return {
  //     ...state,
  //     visibleOptions: CoreSelect.filterOptions(props, state.lastSearch),
  //   };
  // }

  // ======================================================
  // STATIC
  // ======================================================
  static getSelectedOption(props) {
    const {
      options,
      value,
      // selectedValue,
      fieldValue = CoreSelect.defaultProps.fieldValue,
      isSaveFullRecord,
    } = props;

    if (!value || !options) {
      return null;
    }
    if (isSaveFullRecord) {
      return value;
    }
    return options.find((option) => option[fieldValue] === value);
  }
  static getSelectedOptionLabel(props, emptyValue = null) {
    const {
      value,
      // selectedValue,
      isSaveFullRecord,
      fieldLabel = CoreSelect.defaultProps.fieldLabel,
    } = props;

    const result = CoreSelect.getSelectedOption(props);
    return result
      ? result[fieldLabel]
      : emptyValue
        || (isSaveFullRecord && value ? value[fieldLabel] : value);
  }

  // ======================================================
  // UTILS
  // ======================================================
  filterOptions = memoizeOne(
    (searchTerm = null, options, props = this.props) => {
      const {
        maxVisible,
        fieldLabel,
        fieldValue,
        onSearch,
      } = props;

      let resultOptions = options;

      if (onSearch) {
        resultOptions = searchTerm
          ? resultOptions.filter((option) => option[fieldLabel].indexOf(searchTerm) >= 0)
          : resultOptions;
      }
      if (maxVisible && options.length > maxVisible) {
        resultOptions = resultOptions.slice(0, maxVisible);
      }

      return resultOptions.map((option) => {
        const value = option[fieldValue];
        const label = option[fieldLabel];
        // const { disabled } = option;

        return {
          ...option,
          // нужно отделить, чтобы потом можно было в качестве значения проставлять
          [ATTR_FULL_RECORD]: option,
          value,
          label,
        };

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
      });
    },
  );

  updateSelect(value, label = null, optionNode = undefined, contextSelect = undefined, optionRecord = null) {
    const {
      onSelect,
      isSaveFullRecord,
    } = this.props;

    if (onSelect) {
      // todo @ANKU @LOW @BUG_OUT - элемент при выборе показывает в input option.value а не children option
      // onSelect(value);
      emitProcessing(
        onSelect(
          isSaveFullRecord ? optionRecord : value,
          optionNode,
          contextSelect,
          optionRecord,
        ),
        this,
        'isProcessing',
      );
    }
    this.setState({
      selectedLabel: label,
    });
  }

  // ======================================================
  // HANDLERS
  // ======================================================
  @bind()
  handleSearch(searchTerm) {
    const {
      onSearch,
    } = this.props;
    const {
      lastSearch,
      selectedLabel,
    } = this.state;

    if (lastSearch !== searchTerm) {
      if (onSearch) {
        emitProcessing(
          onSearch(searchTerm),
          this,
          'isProcessing',
        );
      } else if (searchTerm === '' && selectedLabel) {
        // если очистили значение (нажав на clear)
        this.updateSelect(null);
      }
    }

    this.setState({
      lastSearch: searchTerm,
    });
  }

  @bind()
  handleSelect(label, optionNode, contextSelect = undefined) {
    if (typeof optionNode === 'object') {
      if (optionNode.value) {
        // бывает что нужно проставлять не id а полные толстенькие изначальные рекорды
        const {
          [ATTR_FULL_RECORD]: optionRecord,
        } = optionNode.options.find(({ value }) => optionNode.value === value) || {};
        // semantic format
        return this.updateSelect(optionNode.value, undefined, optionNode, contextSelect, optionRecord);
      }
      // antd select format
      // todo @ANKU @LOW @BUG_OUT @antd - элемент при выборе показывает в input option.value а не children option
      return this.updateSelect(
        optionNode.props && optionNode.props.optionValue,
        label,
        optionNode,
        contextSelect,
        null,
      );
    } else if (label.target) {
      // event
      return this.updateSelect(label.target.value, undefined, optionNode, contextSelect, null);
    }
    throw new Error('Unknown handleSelect format');
  }

  // ======================================================
  // RENDERS
  // ======================================================
  getControlProps() {
    return omit(this.props, CoreSelect.CUSTOM_FIELDS);
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      maxVisible,
      options,
      selectedValue,
      onTouch,
      value,
      className,
      defaultValue,
      isSaveFullRecord,
      fieldLabel,
      fieldValue,
    } = this.props;
    const {
      lastSearch,
      selectedLabel,
      isProcessing,
    } = this.state;

    const optionsFinal = this.filterOptions(lastSearch, options);
    // let optionsFinal = this.filterOptions(lastSearch, options);
    // if (optionsFinal.length === 0 && value) {
    //   optionsFinal = [
    //     isSaveFullRecord
    //       ? value
    //       : {
    //         [fieldLabel]: selectedLabel,
    //         [fieldValue]: value,
    //       },
    //   ];
    // }

    // взято за основу ANTDSelect
    return (
      <BaseSelect
        mode="combobox"
        showSearch={ true }
        allowClear={ true }
        placeholder={ i18n('components.CoreSelect.placeholder') }

        filterOption={ options.length < maxVisible }
        loading={ isProcessing }

        { ...this.getControlProps() }

        className={ `CoreSelect ${isProcessing ? 'CoreSelect--processing' : ''} ${className || ''}` }

        options={ optionsFinal }
        value={ isSaveFullRecord && value ? value[fieldValue] : value }
        text={ selectedLabel }

        onSelect={ this.handleSelect }
        onSearch={ this.handleSearch }
      />
    );
  }
}
