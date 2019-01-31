/* eslint-disable react/prop-types,no-unused-vars */
let CB = null;

export function initComponents(COMPONENTS_BASE) {
  // ======================================================
  // FORM UI
  // ======================================================
  COMPONENTS_BASE.replace('Form', () => require('./components/Form/CoreForm').default);
  COMPONENTS_BASE.replace('FormLayout', () => require('./components/Form/FormLayout').default);
  COMPONENTS_BASE.replace('Field', () => require('./components/Field/CoreField').default);
  COMPONENTS_BASE.replace('FieldLayout', () => require('./components/Field/FieldLayout').default);

  // ======================================================
  // FORM FIELDS
  // ======================================================
  COMPONENTS_BASE.replace('Input', () => require('./components/fields/Input/CoreInput').default);
  COMPONENTS_BASE.replace('BaseInput', () => ({ controlRef, touched, isProcessing, value, onTouch, ...props }) =>
    <input ref={ controlRef } { ...props } value={ value || '' } />);
  COMPONENTS_BASE.replace('BaseNumberInput', () => ({ controlRef, touched, isProcessing, value, onTouch, ...props }) =>
    <input ref={ controlRef } { ...props } value={ value || '' } type="number" />);

  COMPONENTS_BASE.replace('TextArea', () => require('./components/fields/TextArea/CoreTextArea').default);
  COMPONENTS_BASE.replace('BaseTextArea', () => ({ controlRef, touched, isProcessing, onTouch, ...props }) =>
    <textarea ref={ controlRef } { ...props } />);

  COMPONENTS_BASE.replace('Select', () => require('./components/fields/Select/CoreSelect').default);
  COMPONENTS_BASE.replace('BaseSelect', () => ({ options, value }) =>
    <select value={ value } />);

  COMPONENTS_BASE.replace('DatePicker', () => ({ controlRef, value }) =>
    <input ref={ controlRef } value={ value || '' } type="datetime" />);

  COMPONENTS_BASE.replace('Checkbox', () => ({ controlRef, touched, isProcessing, onTouch, ...props }) =>
    <input ref={ controlRef } { ...props } type="checkbox" />);

  COMPONENTS_BASE.replace('Attachment', () => require('./components/fields/Attachment/Attachment').default);
  COMPONENTS_BASE.replace('AttachmentView', () => require('./components/fields/Attachment/AttachmentView').default);
  COMPONENTS_BASE.replace('AttachmentLayout', () => require('./components/fields/Attachment/AttachmentLayout').default);
  COMPONENTS_BASE.replace('AttachmentUploadControl', () => require('./components/fields/Attachment/AttachmentUploadControl').default);
  COMPONENTS_BASE.replace('AttachmentItemView', () => require('./components/fields/Attachment/AttachmentItem/AttachmentItemView').default);
  COMPONENTS_BASE.replace('AttachmentItemLayout', () => require('./components/fields/Attachment/AttachmentItem/AttachmentItemLayout').default);

  CB = COMPONENTS_BASE;
  return COMPONENTS_BASE;
}

export default function getComponents() {
  return CB;
}
