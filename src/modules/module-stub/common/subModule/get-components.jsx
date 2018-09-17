let CB = null;

export function initComponents(COMPONENTS_BASE) {
  COMPONENTS_BASE.replace('StubPage', () => require('./StubPage/StubPage').default);

  CB = COMPONENTS_BASE;
  return COMPONENTS_BASE;
}

export default function getComponents() {
  return CB;
}
