let CB = null;

export function initComponents(COMPONENTS_BASE) {
  // ======================================================
  // CONTAINERS
  // ======================================================
  /**
   * @deprecated InstanceAttachment - use InstantlyAttachment
   */
  COMPONENTS_BASE.replace('InstanceAttachment', () => require('./containers/InstantlyAttachment').default);
  COMPONENTS_BASE.replace('InstantlyAttachment', () => require('./containers/InstantlyAttachment').default);

  CB = COMPONENTS_BASE;
  return COMPONENTS_BASE;
}

export default function getComponents() {
  return CB;
}
