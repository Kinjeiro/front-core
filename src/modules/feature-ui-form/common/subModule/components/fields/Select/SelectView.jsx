/* eslint-disable no-redeclare */
import React, { PureComponent } from 'react';
// import PropTypes from 'prop-types';
import bind from 'lodash-decorators/bind';
import uniqBy from 'lodash/uniqBy';

import { wrapToArray } from '../../../../../../../common/utils/common';

import getComponents from '../../../get-components';
import SELECT_VIEW_PROP_TYPES_MAP from './Select.propTypes';

const {
  Input,
  Loading,
  Button,
  ListItem,
} = getComponents();

export default class SelectView extends PureComponent {
  static propTypes = SELECT_VIEW_PROP_TYPES_MAP;

  // ======================================================
  // HANDLERS
  // ======================================================
  @bind()
  handleChange(event) {
    const {
      onSelect,
    } = this.props;

    const controlValue = event.target.value;

    return onSelect(controlValue);
  }

  // ======================================================
  // RENDER
  // ======================================================
  // parseToOptionMeta(option, index, allOptions, props = this.props) {
  //   const {
  //     fieldLabel,
  //     fieldId,
  //     renderOption,
  //   } = props;
  //   const {
  //     disabled,
  //   } = option;
  //
  //   return {
  //     // нужно отделить, чтобы потом можно было в качестве значения проставлять
  //     [ATTR_OPTION_VIEW__FULL_RECORD]: option,
  //     ...option,
  //     // options for view
  //     [ATTR_OPTION_VIEW__LABEL]: renderOption
  //       ? renderOption(option[fieldLabel], option, index, allOptions)
  //       : option[fieldLabel],
  //     [ATTR_OPTION_VIEW__VALUE]: option[fieldId],
  //   };
  //
  //   // взято за основу ANTDSelect.Option
  //   // return (
  //   //   <BaseOption
  //   //     key={ value }
  //   //     optionValue={ `${value}` }
  //   //     value={ `${label}` }
  //   //     title={ label }
  //   //     disabled={ disabled }
  //   //   >
  //   //     { label === null ? value : label }
  //   //   </BaseOption>
  //   // );
  // }

  @bind()
  renderOption(optionMeta) {
    const {
      useUnique,
      multiple,
    } = this.props;
    const {
      label,
      recordId,
      isDisabled,
      isSelected,
      value,
    } = optionMeta;

    return (
      <option
        key={ recordId }
        value={ recordId }
        disabled={ isDisabled || (useUnique && multiple && wrapToArray(value).includes(recordId)) }
        selected={ isSelected }
      >
        { label }
      </option>
    );
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      className,

      value,
      // options,
      optionMetas,
      valueOptionMetas,
      multiple,

      isProcessing,

      onRemoveSelected,

      useSearch,
      searchTerm,
      onSearch,

      useUnique,
    } = this.props;

    const optionMetasFinal = !searchTerm && optionMetas.length === 0 && !useUnique
      // наполняем если пока пустой список
      ? uniqBy(wrapToArray(valueOptionMetas), (optionMeta) => optionMeta.recordId)
      : optionMetas;

    return (
      <div className={ `SelectView ${className || ''}` }>
        {
          isProcessing && (
            <Loading />
          )
        }

        {
          useSearch && onSearch && (
            <Input
              value={ searchTerm }
              onChange={ (event) => onSearch(event.target.value) }
            />
          )
        }

        <select
          value={ value }
          multiple={ multiple }
          disabled={ isProcessing }
          onChange={ this.handleChange }
        >
          { optionMetasFinal.map(this.renderOption) }
        </select>

        {
          multiple && (
            <ul>
              {
                valueOptionMetas.map((optionMeta, index) => (
                  <ListItem
                    key={ `${optionMeta.recordId}_${optionMeta.index}` }
                    disabled={ optionMeta.isDisabled }
                  >
                    <span>
                      { optionMeta.label }
                    </span>

                    {
                      !optionMeta.isDisabled && (
                        <Button
                          onClick={ () => onRemoveSelected(optionMeta.recordId, undefined, index) }
                        >
                          [x]
                        </Button>
                      )
                    }
                  </ListItem>
                ))
              }
            </ul>
          )
        }
      </div>
    );
  }
}
