let CB = null;

export function initComponents(COMPONENTS_BASE) {
  // ======================================================
  // Components AUTHS
  // ======================================================
  COMPONENTS_BASE.replace('AuthPageLayout', () => require('./components/AuthPageLayout/AuthPageLayout').default);
  COMPONENTS_BASE.replace('AuthFormLayout', () => require('./components/AuthFormLayout/AuthFormLayout').default);
  COMPONENTS_BASE.replace('AuthEnter', () => require('./components/AuthEnter/AuthEnter').default);
  COMPONENTS_BASE.replace('Signup', () => require('./components/Signup/Signup').default);
  COMPONENTS_BASE.replace('Signin', () => require('./components/Signin/Signin').default);
  COMPONENTS_BASE.replace('Forgot', () => require('./components/Forgot/Forgot').default);
  COMPONENTS_BASE.replace('Reset', () => require('./components/Reset/Reset').default);
  COMPONENTS_BASE.replace('FbAuthIcon', () => require('./components/icons/FbAuthIcon').default);
  COMPONENTS_BASE.replace('GoogleAuthIcon', () => require('./components/icons/GoogleAuthIcon').default);
  COMPONENTS_BASE.replace('VKAuthIcon', () => require('./components/icons/VKAuthIcon').default);

  // ======================================================
  // Containers AUTHS
  // ======================================================
  COMPONENTS_BASE.replace('AuthCheckWrapper', () => require('./containers/AuthCheckWrapper/AuthCheckWrapper').default);
  COMPONENTS_BASE.replace('AuthErrorContainer', () => require('./containers/AuthErrorContainer/AuthErrorContainer').default);

  // ======================================================
  // Components USERS
  // ======================================================
  COMPONENTS_BASE.replace('UserAvatar', () => require('./containers/UserAvatar/UserAvatar').default);

  CB = COMPONENTS_BASE;
  return COMPONENTS_BASE;
}

export default function getComponents() {
  return CB;
}
