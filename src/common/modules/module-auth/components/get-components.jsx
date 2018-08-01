let CB = null;

export function initComponents(COMPONENTS_BASE) {
  COMPONENTS_BASE.replace('AuthPageLayout', () => require('./AuthPageLayout/AuthPageLayout').default);
  COMPONENTS_BASE.replace('AuthFormLayout', () => require('./AuthFormLayout/AuthFormLayout').default);
  COMPONENTS_BASE.replace('AuthEnter', () => require('./AuthEnter/AuthEnter').default);
  COMPONENTS_BASE.replace('Signup', () => require('./Signup/Signup').default);
  COMPONENTS_BASE.replace('Signin', () => require('./Signin/Signin').default);
  COMPONENTS_BASE.replace('Forgot', () => require('./Forgot/Forgot').default);
  COMPONENTS_BASE.replace('Reset', () => require('./Reset/Reset').default);

  CB = COMPONENTS_BASE;
  return COMPONENTS_BASE;
}

export default function getComponents() {
  return CB;
}
