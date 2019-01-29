import React, { PureComponent } from 'react';

// ======================================================
// MODULE
// ======================================================
import getComponents from '../../../get-components';

import PROP_TYPES from './attachment-view-props';

const {
  Button,
} = getComponents();

export default class AttachmentUploadControl extends PureComponent {
  static propTypes = PROP_TYPES;

  render() {
    const {
      id,
      name,
      readOnly,
      multiple,
      accept,
      customControlProps = {},
      hasMaxValues,
      isProcessing,

      addButtonText,

      controlRef,
      onChange,
      onTouch,
    } = this.props;

    /*
      @NOTE: required: false и value = '' - чтобы не сохранять файл внутри инпута, ибо если добавить один файл, потом его удалить, а потом еще раз его добавить, то контрол подумает что ничего не менялось и не дернет действие
    */
    return (
      <div className="Attachment__uploadControl UploadControl">
        <Button
          className="UploadControl__wrapper"
          loading={ isProcessing }
          disabled={ readOnly || hasMaxValues }

          as="label"
          htmlFor={ id }
        >
          { addButtonText }

          <input
            ref={ controlRef }

            id={ id }
            type="file"
            name={ name }
            readOnly={ readOnly }
            multiple={ multiple }
            accept={ accept }
            { ...customControlProps }

            className={ `UploadControl__input ${customControlProps.className || ''}` }
            required={ false }
            value={ '' }

            onClick={ onTouch }
            onChange={ onChange }
          />
        </Button>
      </div>
    );
  }
}
