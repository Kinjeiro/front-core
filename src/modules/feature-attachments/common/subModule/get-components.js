let CB = null;

export function initComponents(COMPONENTS_BASE) {
  // ======================================================
  // CONTAINERS
  // ======================================================
  COMPONENTS_BASE.replace('InstanceAttachment', () => require('./containers/InstanceAttachment').default);

  CB = COMPONENTS_BASE;
  return COMPONENTS_BASE;
}

export default function getComponents() {
  return CB;
}
