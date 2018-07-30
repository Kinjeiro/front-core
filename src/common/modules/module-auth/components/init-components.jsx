let init = false;

function initComponents(COMPONENTS_BASE) {
  if (init) {
    return COMPONENTS_BASE;
  }
  COMPONENTS_BASE.replace('AuthLayout', () => require('./AuthLayout/AuthLayout').default);
  COMPONENTS_BASE.replace('Signup', () => require('./Signup/Signup').default);
  COMPONENTS_BASE.replace('Signin', () => require('./Signin/Signin').default);
  COMPONENTS_BASE.replace('Forgot', () => require('./Forgot/Forgot').default);
  COMPONENTS_BASE.replace('Reset', () => require('./Reset/Reset').default);

  init = true;
  return COMPONENTS_BASE;
}

export default initComponents;
