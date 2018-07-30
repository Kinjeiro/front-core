import COMPONENTS_BASE from '../../../components/ComponentsBase';

Object.apply(COMPONENTS_BASE, {
  // ======================================================
  // AUTH UI
  // ======================================================
  get AuthLayout() {
    return require('./AuthLayout/AuthLayout');
  },
  get Signup() {
    return require('./Signup/Signup');
  },
  get Signin() {
    return require('./Signin/Signin');
  },
  get Forgot() {
    return require('./Forgot/Forgot');
  },
  get Reset() {
    return require('./Reset/Reset');
  },
});

export default COMPONENTS_BASE;
