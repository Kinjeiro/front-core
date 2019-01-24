/* eslint-disable react/sort-comp,comma-dangle */
import React from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import bind from 'lodash-decorators/bind';

import CONSTRAINTS_PROP_TYPE from '../../../../models/model-constraints';

import {
  ATTACHMENT_PROP_TYPE,
} from '../../../../../modules/feature-attachments/common/subModule/model-attachment';

// ======================================================
// MODULE
// ======================================================
import { translateCore } from '../../../../utils/i18n-utils';
import {
  executeVariable,
  wrapToArray,
} from '../../../../utils/common';

import getComponents from '../../../../get-components';

const {
  AttachmentItemView,
  AttachmentLayout,
} = getComponents();

export default class AttachmentView extends React.Component {
  static propTypes = {
    label: PropTypes.node,
    name: PropTypes.string,
    /**
     * Если функция - (onOpenDialog, props, state) => Node
     */
    children: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.func,
    ]),
    usePreview: PropTypes.bool,
    previews: PropTypes.object,
    actions: PropTypes.node,
    dropzoneText: PropTypes.node,
    className: PropTypes.string,
    readOnly: PropTypes.bool,
    editable: PropTypes.bool,
    multiple: PropTypes.bool,
    required: PropTypes.bool,
    constraints: CONSTRAINTS_PROP_TYPE,
    /**
     https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#Limiting_accepted_file_types
     accept="image/png" or accept=".png" — Accepts PNG files.
     accept="image/png, image/jpeg" or accept=".png, .jpg, .jpeg" — Accept PNG or JPEG files.
     accept="image/*" — Accept any file with an image/* MIME type. (Many mobile devices also let the user take a picture with the camera when this is used.)
     accept=".doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
     */
    accept: PropTypes.string,

    value: PropTypes.oneOfType([
      ATTACHMENT_PROP_TYPE,
      PropTypes.arrayOf(ATTACHMENT_PROP_TYPE),
    ]),

    parseValue: PropTypes.func,

    withDescriptions: PropTypes.bool,
    descriptionInputProps: PropTypes.object,

    showAddButton: PropTypes.bool,
    addButtonText: PropTypes.node,

    meta: PropTypes.shape({
      touched: PropTypes.bool,
      error: PropTypes.string,
    }),
    touched: PropTypes.bool,
    isProcessing: PropTypes.bool,

    customControlProps: PropTypes.object,
    controlRef: PropTypes.func,

    onAdd: PropTypes.func,
    onRemove: PropTypes.func,
    onDescriptionChange: PropTypes.func,
    onDescriptionBlur: PropTypes.func,
    onAttachmentClick: PropTypes.func,

    onChange: PropTypes.func,
    onBlur: PropTypes.func,

    onErrors: PropTypes.func,
    onWarnings: PropTypes.func,
  };

  static defaultProps = {
    readOnly: false,
    editable: true,
    multiple: true,
    dropzoneText: translateCore('components.Attachment.dropThere'),
    usePreview: true,
    previews: {},

    showAddButton: true,
    addButtonText: translateCore('components.Attachment.addButton'),
  };

  state = {
    previews: {},
    descriptions: {},
  };

  // ======================================================
  // RENDER
  // ======================================================
  @bind()
  renderAttach(attachment) {
    const {
      usePreview,
      previews: propsPreviews,
      readOnly,
      editable,
      withDescriptions,
      descriptionInputProps,

      onAttachmentClick,
      onRemove,
      onDescriptionChange,
      onDescriptionBlur,
    } = this.props;

    const {
      previews: tempPreviews,
      descriptions,
    } = this.state;

    const {
      id,
      fileName,
    } = attachment;

    return (
      <AttachmentItemView
        key={ id || fileName }
        className="Attachment__AttachmentItem"

        attachment={ attachment }
        customPreview={ tempPreviews[fileName] || propsPreviews[fileName] }
        customDescription={ descriptions[fileName] }

        usePreview={ usePreview }
        readOnly={ readOnly }
        editable={ editable }

        withDescriptions={ withDescriptions }
        descriptionInputProps={ descriptionInputProps }

        onDescriptionChange={ onDescriptionChange }
        onDescriptionBlur={ onDescriptionBlur }
        onClick={ onAttachmentClick }
        onRemove={ onRemove }
      />
    );
  }


  renderLabel() {
    const {
      label,
    } = this.props;
    return (
      <div
        key="label"
        className="Attachment__label"
      >
        {label}
      </div>
    );
  }

  renderAttachments() {
    const {
      value,
    } = this.props;
    const values = wrapToArray(value);

    return values.length > 0 && (
      <div
        className="Attachment__attaches"
      >
        {values.map(this.renderAttach)}
      </div>
    );
  }

  renderUploadControl() {
    const {
      name,
      readOnly,
      multiple,
      required,
      accept,
      customControlProps = {},

      controlRef,
      onChange,
    } = this.props;

    // required={ required }

    return !readOnly && (
      <input
        ref={ controlRef }

        type="file"
        name={ name }
        multiple={ multiple }
        accept={ accept }
        { ...customControlProps }

        className={ `Attachment--uploadControl ${customControlProps.className || ''}` }
        required={ false }
        value={ '' }

        onChange={ onChange }
      />
    );
  }

  renderChildren() {
    const {
      children,
    } = this.props;

    return executeVariable(
      children,
      null,
      this.props,
      this.state,
    );
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      className,
    } = this.props;

    return (
      <AttachmentLayout
        className={ className }
        label={ this.renderLabel() }
        attachments={ this.renderAttachments() }
        uploadControl={ this.renderUploadControl() }
        afterContent={ this.renderChildren() }
      />
    );
  }
}
