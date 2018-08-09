import React from 'react';

let CB = null;

export function initComponents(COMPONENTS_BASE) {
  // ======================================================
  // FORM UI
  // ======================================================
  COMPONENTS_BASE.replace('Form', () => require('./form/CoreForm').default);
  COMPONENTS_BASE.replace('FormLayout', () => require('./form/FormLayout').default);
  COMPONENTS_BASE.replace('Field', () => require('./form/CoreField').default);
  COMPONENTS_BASE.replace('FieldLayout', () => require('./form/FieldLayout').default);

  // ======================================================
  // FORM FIELDS
  // ======================================================
  COMPONENTS_BASE.replace('BaseInput', () => ({ controlRef, touched, ...props }) =>
    <input ref={ controlRef } { ...props } />);
  COMPONENTS_BASE.replace('BaseNumberInput', () => ({ controlRef, touched, ...props }) =>
    <input ref={ controlRef } { ...props } type="number" />);
  COMPONENTS_BASE.replace('Input', () => require('./form/fields/CoreInput').default);
  COMPONENTS_BASE.replace('BaseTextArea', () => ({ controlRef, touched, ...props }) =>
    <textarea ref={ controlRef } { ...props } />);
  COMPONENTS_BASE.replace('TextArea', () => require('./form/fields/CoreTextArea').default);
  COMPONENTS_BASE.replace('BaseSelect', () => ({ options, value }) =>
    <select value={ value } />);
  COMPONENTS_BASE.replace('Select', () => require('./form/fields/CoreSelect').default);
  COMPONENTS_BASE.replace('DatePicker', () => ({ controlRef, value }) =>
    <input ref={ controlRef } value={ value } type="datetime" />);
  COMPONENTS_BASE.replace('Checkbox', () => ({ controlRef, touched, ...props }) =>
    <input ref={ controlRef } { ...props } type="checkbox" />);

  // ======================================================
  // UI
  // ======================================================
  COMPONENTS_BASE.replace('ActionStatus', () => require('./ActionStatus/ActionStatus').default);
  COMPONENTS_BASE.replace('Modal', () => require('./CoreModal/CoreModal').default);
  COMPONENTS_BASE.replace('Link', () => require('./Link/Link').default);
  COMPONENTS_BASE.replace('ListItem', () => require('./ListItem/ListItem').default);
  COMPONENTS_BASE.replace('Loading', () => require('./Loading/Loading').default);
  COMPONENTS_BASE.replace('MediaQuery', () => require('./MediaQuery/MediaQuery').default);
  COMPONENTS_BASE.replace('Notifications', () => require('./Notifications/Notifications').default);
  COMPONENTS_BASE.replace('Notice', () => require('./Notifications/Notice').default);
  COMPONENTS_BASE.replace('ReadMore', () => require('./ReadMore/ReadMore').default);
  COMPONENTS_BASE.replace('UniError', () => require('./UniError/UniError').default);

  // ======================================================
  // FUTURE UI
  // ======================================================
  COMPONENTS_BASE.replace('Button', () => (props) => (<button { ...props } />));
  COMPONENTS_BASE.replace('Segment', () => ({ children, className }) => (<div className={ className }>{ children }</div>));

  // ======================================================
  // PAGES
  // ======================================================
  COMPONENTS_BASE.replace('Info404', () => require('./Info404/Info404').default);

  CB = COMPONENTS_BASE;
  return COMPONENTS_BASE;
}

export default function getComponents() {
  return CB;
}
