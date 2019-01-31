import PropTypes from 'prop-types';

import CONSTRAINTS_PROP_TYPE from '../../../../../../../common/models/model-constraints';

import {
  ATTACHMENT_PROP_TYPE,
} from '../../../../../../feature-instantly-attachments/common/subModule/model-attachment';

export default {
  // ======================================================
  // common
  // ======================================================
  className: PropTypes.string,
  /**
   * Если функция - (openUploadDialogFn, props) => Node
   */
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
  ]),
  controlRef: PropTypes.func,
  customControlProps: PropTypes.object,

  // ======================================================
  // main
  // ======================================================
  id: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.oneOfType([
    ATTACHMENT_PROP_TYPE,
    PropTypes.arrayOf(ATTACHMENT_PROP_TYPE),
  ]),

  // ======================================================
  // state - conditions
  // ======================================================
  readOnly: PropTypes.bool,
  editable: PropTypes.bool,
  multiple: PropTypes.bool,
  required: PropTypes.bool,
  touched: PropTypes.bool,
  isProcessing: PropTypes.bool,
  constraints: CONSTRAINTS_PROP_TYPE,
  /**
   https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#Limiting_accepted_file_types
   accept="image/png" or accept=".png" — Accepts PNG files.
   accept="image/png, image/jpeg" or accept=".png, .jpg, .jpeg" — Accept PNG or JPEG files.
   accept="image/*" — Accept any file with an image/* MIME type. (Many mobile devices also let the user take a picture with the camera when this is used.)
   accept=".doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
   */
  accept: PropTypes.string,
  hasMaxValues: PropTypes.bool,

  // ======================================================
  // inner componennts
  // ======================================================
  label: PropTypes.node,
  usePreview: PropTypes.bool,
  previews: PropTypes.object,
  actions: PropTypes.node,
  dropzoneText: PropTypes.node,
  withDescriptions: PropTypes.bool,
  descriptionInputProps: PropTypes.object,
  showAddButton: PropTypes.bool,
  addButtonText: PropTypes.node,

  // ======================================================
  // listeners
  // ======================================================
  /**
   * (uuidToFileMap, newAttachments, resultAttachments) => {} - всегда, даже если multiple=false, так как uuid важен для InstanceAttachments
   */
  onAdd: PropTypes.func,
  onRemove: PropTypes.func,
  onDescriptionChange: PropTypes.func,
  onDescriptionBlur: PropTypes.func,
  onAttachmentClick: PropTypes.func,

  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onTouch: PropTypes.func,

  onErrors: PropTypes.func,
  onWarnings: PropTypes.func,

  // ======================================================
  // Functions
  // ======================================================
  /**
   * бывает необходимо сделать кастомный вид кнопки загрузки, поэтому ставят showAddButton: false и children: (openUploadDialogFn, props) => {} куда и передается эта функция, чтобы мануально открыть окно выбора файла
   */
  openUploadDialogFn: PropTypes.func,
};
