/* eslint-disable react/sort-comp,comma-dangle */
import React from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import bind from 'lodash-decorators/bind';

import {
  executeVariable,
  wrapToArray,
} from '../../../../../../../common/utils/common';


// ======================================================
// MODULE
// ======================================================
import getComponents from '../../../get-components';

import PROP_TYPES from './attachment-view-props';

const {
  AttachmentItemView,
  AttachmentUploadControl,
  AttachmentLayout,
} = getComponents();

require('./AttachmentView.css');

export default class AttachmentView extends React.Component {
  static propTypes = PROP_TYPES;

  // ======================================================
  // RENDER
  // ======================================================
  @bind()
  renderAttach(attachment) {
    const {
      usePreview,
      previews,
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
      id,
      fileName,
    } = attachment;

    return (
      <AttachmentItemView
        key={ id || fileName }
        className="Attachment__AttachmentItem"

        attachment={ attachment }
        customPreview={ previews[fileName] }

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
      <div className="Attachment__label">
        {label}
      </div>
    );
  }

  renderAttachments() {
    const {
      value,
    } = this.props;
    const values = wrapToArray(value);

    return values && values.length > 0 && (
      <div className="Attachment__attaches">
        {values.map(this.renderAttach)}
      </div>
    );
  }

  renderUploadControl() {
    const {
      editable,
      showAddButton,
  } = this.props;
    return editable && showAddButton && React.createElement(AttachmentUploadControl, this.props);
  }

  renderChildren() {
    const {
      children,
      openUploadDialogFn,
    } = this.props;

    return executeVariable(
      children,
      null,
      openUploadDialogFn,
      this.props,
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
        { ...this.props }
        className={ className }
        label={ this.renderLabel() }
        attachments={ this.renderAttachments() }
        uploadControl={ this.renderUploadControl() }
        afterContent={ this.renderChildren() }
      />
    );
  }
}
