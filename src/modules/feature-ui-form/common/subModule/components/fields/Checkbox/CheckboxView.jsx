import React, { PureComponent } from 'react';
// import PropTypes from 'prop-types';
import bind from 'lodash-decorators/bind';


// import i18n from '../../i18n';
import getComponents from '../../../get-components';
import CHECKBOX_VIEW_PROP_TYPES_MAP from './Checkbox.propTypes';

const {
  Button,
  Loading,
} = getComponents();

export default class CheckboxView extends PureComponent {
  static propTypes = CHECKBOX_VIEW_PROP_TYPES_MAP;

  // ======================================================
  // HANDLERS
  // ======================================================
  @bind()
  handleChange(event) {
    const {
      onChangeCheck,
    } = this.props;

    const {
      target: {
        value: recordId,
        checked,
      },
    } = event;

    return onChangeCheck(recordId, checked);
  }

  // ======================================================
  // RENDER
  // ======================================================
  @bind()
  renderOption(optionMeta) {
    const {
      readOnly,
    } = this.props;
    const {
      label,
      recordId,
      isDisabled,
      isSelected,
    } = optionMeta;

    return (
      <div key={ recordId }>
        <input
          value={ recordId }
          readOnly={ readOnly }
          disabled={ isDisabled }
          checked={ isSelected }
          type="checkbox"
          onClick={ this.handleChange }
        />

        { label }
      </div>
    );
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      className,

      optionMetas,
      valueOptionMeta,
      multiple,

      isLoading,

      onCheckAll,
      onUncheckAll,
    } = this.props;

    const visibilityOptionMetas = optionMetas && optionMetas.length > 0
      ? optionMetas
      : valueOptionMeta || [];

    return (
      <div className={ `CheckboxView ${className || ''}` }>
        {
          isLoading && (
            <Loading />
          )
        }

        {
          visibilityOptionMetas.map(this.renderOption)
        }

        {
          multiple && (onCheckAll || onUncheckAll) && (
            <div>
              {
                onCheckAll && (
                  <Button onClick={ onCheckAll }>
                    Выбрать все
                  </Button>
                )
              }
              {
                onUncheckAll && (
                  <Button onClick={ onUncheckAll }>
                    Сбросить все
                  </Button>
                )
              }
            </div>
          )
        }
      </div>
    );
  }
}
