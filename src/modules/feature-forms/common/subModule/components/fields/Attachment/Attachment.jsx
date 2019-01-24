/* eslint-disable react/sort-comp,no-use-before-define,max-len */
import React from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import bind from 'lodash-decorators/bind';

import {
  // generateId,
  wrapToArray,
  difference,
} from '../../../../../../../common/utils/common';
import CONSTRAINTS_PROP_TYPE from '../../../../../../../common/models/model-constraints';
import getApiClient from '../../../../../../../common/helpers/get-api-client';

import {
  createAttachment,
  normalizeAttachment,
  ATTACHMENT_PROP_TYPE, createTempAttachment,
} from '../../../../../../feature-attachments/common/subModule/model-attachment';

// ======================================================
// MODULE
// ======================================================
import { translateCore } from '../../../../../../../common/utils/i18n-utils';

import getComponents from '../../../../../../../common/get-components';

const {
  AttachmentView,
} = getComponents();

require('./Attachment.css');

export const DEFAULT_MULTIPLE_MAX_SIZE = 10;
export const DEFAULT_MAX_BYTES = 10485760; // 10Mb

function filterFiles(array, predicatFn) {
  const filtered = [];
  const aborted = [];
  wrapToArray(array).forEach((element, index) => {
    const isFiltered = predicatFn(element, index);
    if (isFiltered) {
      filtered.push(element);
    } else {
      aborted.push(element);
    }
  });

  return {
    filtered,
    aborted,
    abortedStr: aborted.map(({ name }) => `"${name}"`).join(', '),
  };
}

export default class Attachment extends React.Component {
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
    acceptOnlyImages: PropTypes.bool,

    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
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

    /**
     * (uuidToFileMap, newAttachments, resultAttachments) => {} - всегда, даже если multiple=false, так как uuid важен для InstanceAttachments
     */
    onAdd: PropTypes.func,
    onRemove: PropTypes.func,
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

  static normalizeValue(value) {
    return Array.isArray(value)
      ? value.map((valueItem) => normalizeAttachment(valueItem))
      : normalizeAttachment(value);
  }

  static parseValueToString(value) {
    const {
      id,
      fileName,
      // preview,
      // description,
    } = Attachment.normalizeValue(value);

    return fileName || id;
  }

  state = {
    previews: {},
  };

  // ======================================================
  // UTILS
  // ======================================================
  getValues() {
    const {
      value,
    } = this.props;

    return wrapToArray(Attachment.normalizeValue(value));
  }

  // addPreview(fileName, previewData) {
  //   this.setState({
  //     previews: {
  //       ...this.state.previews,
  //       [fileName]: previewData,
  //     },
  //   });
  // }

  parseValueFromFile(file) {
    const {
      parseValue,
    } = this.props;
    /*
     FILE: {
       lastModified: 1463127849264,
       lastModifiedDate: Fri May 13 2016 11:24:09 GMT+0300 (RTZ 2 (зима)) {},
       name: "test name.jpg",
       preview: "blob:http://localhost:8080/3b5f332a-45a7-49a8-9a1e-5b9225bd831e",
       size: 57613,
       type: "image/jpeg",
       webkitRelativePath: "",
     }
     */

    const {
      name,
      size,
      type,
      preview,
    } = file;

    return {
      ...createTempAttachment(
        createAttachment(
          null,
          name,
          size,
          type,
          null,
          null,
          preview,
        ),
      ),
      ...(parseValue ? parseValue(file) : {}),
    };
  }

  update(resultValues, affectedValues) {
    const {
      multiple,
      onChange,
      onBlur,
    } = this.props;

    let resultValuesFinal = resultValues;
    if (!multiple) {
      resultValuesFinal = resultValuesFinal.length > 0 ? resultValuesFinal[0] : null;
    }
    if (onBlur) {
      // update touched
      onBlur(resultValuesFinal, affectedValues);
    }
    if (onChange) {
      // update value
      onChange(resultValuesFinal, affectedValues);
    }
  }




  // ======================================================
  // HANDLERS
  // ======================================================
  @bind()
  handleChange(event, addedFiles/* , removedFiles */) {
    const {
      usePreview,
      onAdd,
      constraints: {
        multipleMaxSize = DEFAULT_MULTIPLE_MAX_SIZE,
        maxBytes = DEFAULT_MAX_BYTES,
        minBytes,
      } = {},
      onWarnings,
      multiple,
    } = this.props;

    const {
      previews,
    } = this.state;

    const isReplaceData = !multiple;

    // event.target.files может быть FileList там не все методы массива
    let addedFilesFinal = wrapToArray(addedFiles || (event && event.target.files));

    debugger;


    const warnings = [];
    const currentAttachments = this.getValues();
    const newAmount = currentAttachments.length + addedFilesFinal.length;
    if (typeof multipleMaxSize !== 'undefined' && newAmount > multipleMaxSize) {
      const {
        filtered,
        aborted,
        abortedStr,
      } = filterFiles(addedFilesFinal, (element, index) => index <= multipleMaxSize);
      addedFilesFinal = filtered;
      // todo @ANKU @LOW - @i18n @@loc @@plur
      warnings.push(`${aborted.length} файлов (${abortedStr}) не были добавлены, так как превышен лимит кол-ва файлов ${multipleMaxSize}.`);
    }
    if (typeof maxBytes !== 'undefined') {
      const {
        filtered,
        aborted,
        abortedStr,
      } = filterFiles(addedFilesFinal, ({ size }) => size <= maxBytes);
      if (abortedStr) {
        // todo @ANKU @LOW - @i18n @@loc @@plur
        warnings.push(`${aborted.length} файлов (${abortedStr}) не были добавлены, так как превыше лимит размера файлов ${parseInt(maxBytes / 1000, 10)} кБ.`);
        addedFilesFinal = filtered;
      }
    }
    if (typeof minBytes !== 'undefined') {
      const {
        filtered,
        aborted,
        abortedStr,
      } = filterFiles(addedFilesFinal, ({ size }) => size >= minBytes);
      if (abortedStr) {
        // todo @ANKU @LOW - @i18n @@loc @@plur
        warnings.push(`${aborted.length} файлов (${abortedStr}) не были добавлены, так как размер файлов меньше минимального ${parseInt(minBytes / 1000, 10)} кБ.`);
        addedFilesFinal = filtered;
      }
    }
    if (window && warnings.length) {
      // чтобы сработало после onChange, ибо по нему очищается
      window.setTimeout(() => onWarnings(warnings, true), 10);
    }

    if (addedFilesFinal.length > 0) {
      if (usePreview) {
        const newPreviews = isReplaceData ? {} : { ...previews };
        addedFilesFinal.forEach((file) => {
          if (file.preview) {
            newPreviews[file.name] = file.preview;
          } else {
            // todo @ANKU @LOW - надо сделать удаленную загрузку Promise.all а потом только вызвать один раз setState
            // const reader = new FileReader();
            // reader.onload = (onloadEvent) =>
            //   this.addPreview(file.name, onloadEvent.target.result);
            // reader.readAsDataURL(file);
          }
        });
        this.setState({
          previews: newPreviews,
        });
      }

      // todo @ANKU @LOW - мапа не очень подходит ибо важна последовательность выбора в FileChooser
      const newFilesMap = {};
      const newAttachments = addedFilesFinal.map((file) => {
        const newAttach = this.parseValueFromFile(file);

        newFilesMap[newAttach.uuid] = file;
        return newAttach;
      });

      const resultAttachments = [
        ...(isReplaceData ? {} : this.getValues()),
        ...newAttachments,
      ];

      if (onAdd) {
        onAdd(multiple ? newFilesMap : addedFilesFinal[0], newAttachments, resultAttachments);
      }
      this.update(resultAttachments, newAttachments, newFilesMap);
    }
  }

  // @bind()
  // handleDropOrClick(acceptedFiles, rejectedFiles, event) {
  //   let addedFiles;
  //   if (event.type === 'drop') {
  //     if (acceptedFiles.length) {
  //       // convert FileList or [File] to array
  //       addedFiles = [...((event.dataTransfer && event.dataTransfer.files) || acceptedFiles)];
  //     } else {
  //       addedFiles = [];
  //     }
  //   } else if (event.type === 'change') {
  //     addedFiles = [...event.target.files];
  //   } else {
  //     addedFiles = event;
  //   }
  //
  //   return this.handleChange(event, addedFiles, rejectedFiles);
  // }

  @bind()
  handleAdd(addedFiles, event) {
    return this.handleChange(event, addedFiles);
  }

  @bind()
  handleAttachClick(attachment) {
    const {
      onAttachmentClick,
    } = this.props;
    const {
      downloadUrl,
      fileName,
    } = attachment;

    if (onAttachmentClick) {
      onAttachmentClick(attachment);
    } else if (downloadUrl) {
      getApiClient().downloadFile(downloadUrl, fileName);
    }
  }

  @bind()
  handleAttachRemove(attachment, event) {
    const {
      fileName,
    } = attachment;
    const {
      onRemove,
    } = this.props;
    const {
      previews,
    } = this.state;

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const values = this.getValues();
    const resultValues = values.filter((attachItem) => attachItem.fileName !== fileName);

    if (onRemove) {
      onRemove(attachment, resultValues);
    }

    this.update(resultValues, attachment);

    delete previews[fileName];

    this.setState({
      previews,
    });
  }


  @bind()
  handleDescriptionBlur(attachment, newDescription) {
    const {
      onDescriptionBlur,
    } = this.props;
    const {
      fileName,
      id,
      description,
    } = attachment;


    // let curAttach = values.find((value) => value.fileName === fileName);
    if (description !== newDescription) {
      const values = this.getValues();
      const updatedAttach = {
        ...attachment,
        description: newDescription,
      };

      const finalResult = values.map((value) => (value.fileName === fileName ? updatedAttach : value));

      if (onDescriptionBlur) {
        onDescriptionBlur(id || fileName, newDescription, finalResult, updatedAttach);
      }
      if (updatedAttach) {
        this.update(finalResult, updatedAttach);
      }
    }
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      className = '',
      readOnly,
      accept,
      acceptOnlyImages,
      withDescriptions,
    } = this.props;

    return (
      <AttachmentView
        { ...omit(this.props, OMIT_PROPS) }
        accept={ acceptOnlyImages ? 'image/*' : accept }

        className={ `Attachment ${className} ${readOnly ? 'Attachment--readOnly' : ''} ${withDescriptions ? 'Attachment--withDescription' : ''}` }
        value={ this.getValues() }

        onChange={ this.handleChange }
        onAdd={ this.handleAdd }
        onRemove={ this.handleAttachRemove }
        onAttachmentClick={ this.handleAttachClick }
        onDescriptionBlur={ this.handleDescriptionBlur }
      />
    );
  }
}

const OMIT_PROPS = difference(Object.keys(Attachment.propTypes), Object.keys(AttachmentView.propTypes));

