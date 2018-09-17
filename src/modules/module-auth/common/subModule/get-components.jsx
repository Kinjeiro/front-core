let CB = null;

export function initComponents(COMPONENTS_BASE) {
  COMPONENTS_BASE.replace('AuthPageLayout', () => require('./components/AuthPageLayout/AuthPageLayout').default);
  COMPONENTS_BASE.replace('AuthFormLayout', () => require('./components/AuthFormLayout/AuthFormLayout').default);
  COMPONENTS_BASE.replace('AuthEnter', () => require('./components/AuthEnter/AuthEnter').default);
  COMPONENTS_BASE.replace('Signup', () => require('./components/Signup/Signup').default);
  COMPONENTS_BASE.replace('Signin', () => require('./components/Signin/Signin').default);
  COMPONENTS_BASE.replace('Forgot', () => require('./components/Forgot/Forgot').default);
  COMPONENTS_BASE.replace('Reset', () => require('./components/Reset/Reset').default);

  COMPONENTS_BASE.replace('AuthCheckWrapper', () => require('./AuthCheckWrapper/AuthCheckWrapper').default);
  COMPONENTS_BASE.replace('AuthErrorContainer', () => require('./AuthErrorContainer/AuthErrorContainer').default);

  CB = COMPONENTS_BASE;
  return COMPONENTS_BASE;
}

export default function getComponents() {
  return CB;
}