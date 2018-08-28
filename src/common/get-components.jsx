/* eslint-disable max-len,react/prop-types,no-unused-vars */
import React from 'react';

let CB = null;

export function initComponents(COMPONENTS_BASE) {
  require('./app-style/init.css');

  // ======================================================
  // FORM UI
  // ======================================================
  COMPONENTS_BASE.replace('Form', () => require('./components/form/CoreForm').default);
  COMPONENTS_BASE.replace('FormLayout', () => require('./components/form/FormLayout').default);
  COMPONENTS_BASE.replace('Field', () => require('./components/form/CoreField').default);
  COMPONENTS_BASE.replace('FieldLayout', () => require('./components/form/FieldLayout').default);

  // ======================================================
  // FORM FIELDS
  // ======================================================
  COMPONENTS_BASE.replace('BaseInput', () => ({ controlRef, touched, ...props }) =>
    <input ref={ controlRef } { ...props } />);
  COMPONENTS_BASE.replace('BaseNumberInput', () => ({ controlRef, touched, ...props }) =>
    <input ref={ controlRef } { ...props } type="number" />);
  COMPONENTS_BASE.replace('Input', () => require('./components/form/fields/CoreInput').default);
  COMPONENTS_BASE.replace('BaseTextArea', () => ({ controlRef, touched, ...props }) =>
    <textarea ref={ controlRef } { ...props } />);
  COMPONENTS_BASE.replace('TextArea', () => require('./components/form/fields/CoreTextArea').default);
  COMPONENTS_BASE.replace('BaseSelect', () => ({ options, value }) =>
    <select value={ value } />);
  COMPONENTS_BASE.replace('Select', () => require('./components/form/fields/CoreSelect').default);
  COMPONENTS_BASE.replace('DatePicker', () => ({ controlRef, value }) =>
    <input ref={ controlRef } value={ value } type="datetime" />);
  COMPONENTS_BASE.replace('Checkbox', () => ({ controlRef, touched, ...props }) =>
    <input ref={ controlRef } { ...props } type="checkbox" />);
  COMPONENTS_BASE.replace('Attachment', () => ({ controlRef, touched, ...props }) =>
    <input ref={ controlRef } { ...props } type="file" />);

  // ======================================================
  // UI
  // ======================================================
  COMPONENTS_BASE.replace('ActionStatus', () => require('./components/ActionStatus/ActionStatus').default);
  COMPONENTS_BASE.replace('Modal', () => require('./components/CoreModal/CoreModal').default);
  COMPONENTS_BASE.replace('ErrorBoundary', () => require('./components/ErrorBoundary/ErrorBoundary').default);
  COMPONENTS_BASE.replace('ListItem', () => require('./components/ListItem/ListItem').default);
  COMPONENTS_BASE.replace('Loading', () => require('./components/Loading/Loading').default);
  COMPONENTS_BASE.replace('MediaQuery', () => require('./components/MediaQuery/MediaQuery').default);
  COMPONENTS_BASE.replace('Notifications', () => require('./components/Notifications/Notifications').default);
  COMPONENTS_BASE.replace('Notice', () => require('./components/Notifications/Notice').default);
  COMPONENTS_BASE.replace('ReadMore', () => require('./components/ReadMore/ReadMore').default);
  COMPONENTS_BASE.replace('ThemeProvider', () => require('./components/ThemeProvider/ThemeProvider').default);
  COMPONENTS_BASE.replace('UniError', () => require('./components/UniError/UniError').default);

  // ======================================================
  // FUTURE UI
  // ======================================================
  COMPONENTS_BASE.replace('Segment', () => ({ children, className }) => (<div className={ className }>{ children }</div>));

  // ======================================================
  // PAGES
  // ======================================================
  COMPONENTS_BASE.replace('Info404', () => require('./components/Info404/Info404').default);

  // ======================================================
  // CONTAINERS
  // ======================================================
  COMPONENTS_BASE.replace('BaseButton', () => ({ primary, ...props }) => (<button type="button" { ...props } />));
  COMPONENTS_BASE.replace('Button', () => require('./containers/CoreButton/CoreButton').default);
  COMPONENTS_BASE.replace('Link', () => require('./containers/Link/Link').default);
  COMPONENTS_BASE.replace('ModuleLink', () => require('./containers/ModuleLink/ModuleLink').default);

  COMPONENTS_BASE.replace('AuthCheckWrapper', () => require('./containers/AuthCheckWrapper/AuthCheckWrapper').default);
  COMPONENTS_BASE.replace('AuthErrorContainer', () => require('./containers/AuthErrorContainer/AuthErrorContainer').default);
  COMPONENTS_BASE.replace('CoreApp', () => require('./containers/CoreApp/CoreApp').default);
  COMPONENTS_BASE.replace('ErrorPage', () => require('./containers/ErrorPage/ErrorPage').default);
  COMPONENTS_BASE.replace('I18NProvider', () => require('./containers/I18NProvider/I18NProvider').default);

  CB = COMPONENTS_BASE;
  return COMPONENTS_BASE;
}

export default function getComponents() {
  return CB;
}
