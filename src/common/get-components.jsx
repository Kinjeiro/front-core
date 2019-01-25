/* eslint-disable max-len,react/prop-types,no-unused-vars */
import React from 'react';

let CB = null;

export function initComponents(COMPONENTS_BASE) {
  require('./app-style/init.css');

  // ======================================================
  // UI
  // ======================================================
  COMPONENTS_BASE.replace('Button', () => require('./components/Button/Button').default);
  COMPONENTS_BASE.replace('Image', () => require('./components/Image/Image').default);
  COMPONENTS_BASE.replace('Icon', () => require('./components/Icon/Icon').default);
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
  COMPONENTS_BASE.replace('UnescapedHtml', () => require('./components/UnescapedHtml/UnescapedHtml').default);
  COMPONENTS_BASE.replace('ErrorLabel', () => require('./components/ErrorLabel/ErrorLabel').default);

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
  COMPONENTS_BASE.replace('PermissionButton', () => require('./containers/PermissionButton/PermissionButton').default);
  COMPONENTS_BASE.replace('Link', () => require('./containers/Link/Link').default);
  COMPONENTS_BASE.replace('ModuleLink', () => require('./containers/ModuleLink/ModuleLink').default);

  COMPONENTS_BASE.replace('CoreApp', () => require('./containers/CoreApp/CoreApp').default);
  COMPONENTS_BASE.replace('ErrorPage', () => require('./containers/ErrorPage/ErrorPage').default);
  COMPONENTS_BASE.replace('I18NProvider', () => require('./containers/I18NProvider/I18NProvider').default);

  CB = COMPONENTS_BASE;
  return COMPONENTS_BASE;
}

export default function getComponents() {
  return CB;
}
