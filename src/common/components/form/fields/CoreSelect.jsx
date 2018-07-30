/* eslint-disable no-unused-vars */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import bind from 'lodash-decorators/bind';
import omit from 'lodash/omit';

import i18n from '../../../utils/i18n-utils';

import componentsBase from '../../ComponentsBase';

const {
  BaseSelect,
  BaseOption,
} = componentsBase;

export default class CoreSelect extends PureComponent {
  static CUSTOM_FIELDS = [
    'selectedValue',
    'fieldLabel',
    'fieldValue',
    'maxVisible',
    'onSelect',
  ];
  static propTypes = {
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

    fieldLabel: PropTypes.string,
    fieldValue: PropTypes.string,
    maxVisible: PropTypes.number,

    onSelect: PropTypes.func,
  };

  static defaultProps = {
    options: [],
    maxVisible: 30,
    fieldLabel: 'label',
    fieldValue: 'value',
  };

  state = {
    visibleOptions: this.filterOptions(),
    lastSearch: null,
    selectedLabel: CoreSelect.getSelectedOptionLabel(this.props),
  };

  // ======================================================
  // STATIC
  // ======================================================
  static getSelectedOption(props) {
    const {
      options,
      selectedValue,
      fieldValue = CoreSelect.defaultProps.fieldValue,
    } = props;

    if (!selectedValue || !options) {
      return null;
    }

    return options.find((option) => option[fieldValue] === selectedValue);
  }
  static getSelectedOptionLabel(props, emptyValue = null) {
    const {
      selectedValue,
      fieldLabel = CoreSelect.defaultProps.fieldLabel,
    } = props;

    const result = CoreSelect.getSelectedOption(props);
    return result ? result[fieldLabel] : emptyValue || selectedValue;
  }

  // ======================================================
  // UTILS
  // ======================================================
  filterOptions(props = this.props, searchTerm = null) {
    const {
      options,
      maxVisible,
      fieldLabel,
    } = props;

    let resultOptions = options;

    if (searchTerm) {
      resultOptions = resultOptions.filter((option) => option[fieldLabel].indexOf(searchTerm) >= 0);
    }
    if (maxVisible && options.length > maxVisible) {
      resultOptions = resultOptions.slice(0, maxVisible);
    }

    return resultOptions;
  }

  updateSelect(value, label = null) {
    const {
      onSelect,
    } = this.props;

    if (onSelect) {
      // todo @ANKU @LOW @BUG_OUT - элемент при выборе показывает в input option.value а не children option
      // onSelect(value);
      onSelect(value);
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
      lastSearch,
      selectedLabel,
    } = this.state;

    if (lastSearch !== searchTerm) {
      if (searchTerm === '' && selectedLabel) {
        // если очистили значение (нажав на clear)
        this.updateSelect(null);
      }
      this.setState({
        visibleOptions: this.filterOptions(this.props, searchTerm),
        lastSearch: searchTerm,
      });
    }
  }

  @bind()
  handleSelect(label, optionNode) {
    // todo @ANKU @LOW @BUG_OUT @antd - элемент при выборе показывает в input option.value а не children option
    this.updateSelect(optionNode.props.optionValue, label);
  }

  // ======================================================
  // RENDERS
  // ======================================================
  renderOptions() {
    const {
      fieldLabel,
      fieldValue,
    } = this.props;
    const {
      visibleOptions,
    } = this.state;

    return visibleOptions.map((option) => {
      const value = option[fieldValue];
      const label = option[fieldLabel];
      const { disabled } = option;

      return (
        <BaseOption
          key={ value }
          optionValue={ `${value}` }
          value={ `${label}` }
          title={ label }
          disabled={ disabled }
        >
          { label === null ? value : label }
        </BaseOption>
      );
    });
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      maxVisible,
      options,
      selectedValue,
      ...otherProps
    } = this.props;
    const {
      selectedLabel,
    } = this.state;

    return (
      <BaseSelect
        mode="combobox"
        className="CoreSelect"
        defaultValue={ selectedLabel || selectedValue || undefined }
        filterOption={ options.length < maxVisible }
        showSearch={ true }
        allowClear={ true }
        placeholder={ i18n('components.CoreSelect.placeholder') }

        onSelect={ this.handleSelect }
        onSearch={ this.handleSearch }

        { ...omit(otherProps, ...CoreSelect.CUSTOM_FIELDS) }
      >
        { this.renderOptions() }
      </BaseSelect>
    );
  }
}
