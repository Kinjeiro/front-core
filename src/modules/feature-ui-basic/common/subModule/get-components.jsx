let CB = null;

export function initComponents(COMPONENTS_BASE) {
  // ======================================================
  // UI
  // ======================================================
  COMPONENTS_BASE.replace('Button', () => require('./components/Button/Button').default);
  COMPONENTS_BASE.replace('ButtonView', () => require('./components/Button/ButtonView').default);
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
  COMPONENTS_BASE.replace('UniError', () => require('./components/UniError/UniError').default);
  COMPONENTS_BASE.replace('UnescapedHtml', () => require('./components/UnescapedHtml/UnescapedHtml').default);
  COMPONENTS_BASE.replace('ErrorLabel', () => require('./components/ErrorLabel/ErrorLabel').default);

  // ======================================================
  // FUTURE UI
  // ======================================================
  COMPONENTS_BASE.replace('Segment', () => require('./components/Segment/Segment').default);

  CB = COMPONENTS_BASE;
  return COMPONENTS_BASE;
}

export default function getComponents() {
  return CB;
}
