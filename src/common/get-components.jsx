/* eslint-disable max-len,react/prop-types,no-unused-vars */
import React from 'react';

let CB = null;

export function initComponents(COMPONENTS_BASE) {
  require('./app-style/init.css');

  // ======================================================
  // PAGES
  // ======================================================
  COMPONENTS_BASE.replace('Info404', () => require('./components/Info404/Info404').default);
  COMPONENTS_BASE.replace('ThemeProvider', () => require('./components/ThemeProvider/ThemeProvider').default);

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
