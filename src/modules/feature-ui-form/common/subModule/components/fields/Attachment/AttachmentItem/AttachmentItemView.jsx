/* eslint-disable react/sort-comp,jsx-a11y/no-static-element-interactions */
import React from 'react';
import PropTypes from 'prop-types';
import bind from 'lodash-decorators/bind';

import { translateCore } from '../../../../../../../../common/utils/i18n-utils';
import { valueFromRange } from '../../../../../../../../common/utils/common';

import ATTACHMENT_PROP_TYPE from '../../../../../../../feature-instantly-attachments/common/subModule/model-attachment';

// ======================================================
// MODULE
// ======================================================
import getComponents from '../../../../get-components';

const {
  Input,
  Icon,
  Image,

  AttachmentItemLayout,
} = getComponents();

require('./AttachmentItemView.css');

export default class AttachmentItemView extends React.Component {
  static propTypes = {
    attachment: ATTACHMENT_PROP_TYPE,
    customPreview: PropTypes.string,
    customDescription: PropTypes.node,

    usePreview: PropTypes.bool,

    readOnly: PropTypes.bool,
    editable: PropTypes.bool,

    withDescriptions: PropTypes.bool,
    descriptionInputProps: PropTypes.object,

    /**
     * (attachment, newDescription, event) => {}
     */
    onDescriptionChange: PropTypes.func,
    /**
     * (attachment, newDescription, event) => {}
     */
    onDescriptionBlur: PropTypes.func,
    /**
     * (attachment, event) => {}
     */
    onClick: PropTypes.func,
    /**
     * (attachment) => {}
     */
    onRemove: PropTypes.func,
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

  isImage() {
    const {
      attachment: {
        type,
      },
    } = this.props;
    return type.indexOf('image') === 0;
  }

  // ======================================================
  // HANDLERS
  // ======================================================
  @bind()
  handleDescriptionChange(event, { value }) {
    const {
      attachment,
      onDescriptionChange,
    } = this.props;
    if (onDescriptionChange) {
      onDescriptionChange(attachment, value, event);
    }
  }
  @bind()
  handleDescriptionChangedBlur(event, { value }) {
    const {
      attachment,
      onDescriptionBlur,
    } = this.props;
    if (onDescriptionBlur) {
      onDescriptionBlur(attachment, value, event);
    }
  }
  @bind()
  handleAttachmentClick(event) {
    const {
      attachment,
      onClick,
    } = this.props;

    if (onClick) {
      onClick(attachment, event);
    }
  }
  @bind()
  handleAttachmentRemove() {
    const {
      attachment,
      onRemove,
    } = this.props;

    if (onRemove) {
      onRemove(attachment);
    }
  }

  // ======================================================
  // RENDERS
  // ======================================================
  renderDescription() {
    const {
      attachment: {
        description,
      },
      readOnly,
      withDescriptions,
      descriptionInputProps: {
        className,

        ...inputProps
      } = {},
      customDescription,
      onDescriptionChange,
      onDescriptionBlur,
    } = this.props;

    return withDescriptions && (
      <Input
        onChange={ onDescriptionChange ? this.handleDescriptionChange : undefined }
        onChangedBlur={ onDescriptionBlur ? this.handleDescriptionChangedBlur : undefined }
        readOnly={ readOnly }
        value={ customDescription || description || '' }
        { ...inputProps }
        className={ `AttachmentItem__description ${className || ''}` }
      />
    );
  }

  renderAttachmentDetails() {
    const {
      attachment: {
        fileName,
      },
    } = this.props;

    return (
      <span
        className="AttachmentItem__fileName"
        onClick={ this.handleAttachmentClick }
      >
        { fileName }
      </span>
    );
  }

  renderRemoveButton() {
    const {
      readOnly,
      editable,
    } = this.props;

    return !readOnly && editable && (
      <span
        className="AttachmentItem__remove"
        onClick={ this.handleAttachmentRemove }
      >
        <Icon name="remove" />
      </span>
    );
  }

  renderPreview() {
    const {
      attachment: {
        id,
        fileName,
        preview,
        description,
        downloadUrl,
      },
      customPreview,
      usePreview,
    } = this.props;

    let finalPreview = customPreview || preview;
    if (!finalPreview && this.isImage()) {
      finalPreview = downloadUrl;
    }

    const title = description || fileName || id;

    return usePreview && finalPreview && (
      <Image
        className="AttachmentItem__preview"
        src={ finalPreview }
        alt={ title }
        title={ title }
        onClick={ this.handleAttachmentClick }
      />
    );
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      attachment: {
        isNew,
        loaded,
        downloadUrl,
      },
    } = this.props;

    const progress = isNew ? valueFromRange(loaded, [0, 25, 50, 75, 100]) : null;

    const className = `AttachmentItem ${progress !== null ? `AttachmentItem--loaded${progress}` : ''} ${downloadUrl !== null ? 'AttachmentItem--fullLoaded' : ''}`;

    return (
      <AttachmentItemLayout
        className={ className }

        attachmentDetails={ this.renderAttachmentDetails() }
        removeButton={ this.renderRemoveButton() }
        preview={ this.renderPreview() }
        description={ this.renderDescription() }
      />
    );
  }
}
