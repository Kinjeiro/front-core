let CB = null;

export function initComponents(COMPONENTS_BASE) {
  COMPONENTS_BASE.replace('TestForm', () => require('./containers/StubPage/TestForm/TestForm').default);
  COMPONENTS_BASE.replace('StubPage', () => require('./containers/StubPage/StubPage').default);
  COMPONENTS_BASE.replace('AuthStubPage', () => require('./containers/AuthStubPage/AuthStubPage').default);
  COMPONENTS_BASE.replace('AuthStubPageWithDecorators', () => require('./containers/AuthStubPageWithDecorators/AuthStubPageWithDecorators').default);

  CB = COMPONENTS_BASE;
  return COMPONENTS_BASE;
}

export default function getComponents() {
  return CB;
}
