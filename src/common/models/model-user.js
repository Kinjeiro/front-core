import PropTypes from 'prop-types';

/*
 {
 //userId: '59c28a68b52cec41904f9848',
 username: 'ivanovI',
 userType: undefined,

 firstName: 'Ivan',
 middleName: 'Ivanovich',
 lastName: 'Ivanov',
 displayName: 'Ivanov I. I.',
 email: 'ivanovi@local.com',
 profileImageURI: undefined,
 phone: undefined,
 address: undefined,

 provider: 'local',

 created: '2017-09-20T15:34:00.742Z',
 updated: '2017-09-20T15:34:00.741Z',

 roles: ['user'],
 permissions: [],
 };
 */

// ======================================================
// PUBLIC - доступна всем
// ======================================================
// from auth-server\src\db\model\user.js
export const PUBLIC_USER_PROP_TYPE_MAP = {
  userId: PropTypes.string,
  aliasId: PropTypes.string,
  displayName: PropTypes.string,
  description: PropTypes.string,
  computedDisplayName: PropTypes.string,
  // profileImageURI: PropTypes.string, // не передаем, для этого есть метод front-core\src\common\app-redux\reducers\app\users.js::getUserAvatarUrl(userIdOrAliasId)
};
export const PUBLIC_USER_PROP_TYPE = PropTypes.shape(PUBLIC_USER_PROP_TYPE_MAP);
export const DEFAULT_PUBLIC_USER = {
  userId: '',
  aliasId: undefined,
  displayName: '',
  description: '',
  computedDisplayName: '',
};

// ======================================================
// PROTECTED - информацию, которую получает специальная роль, для выдачи подробной инфы о пользователе (имя, телефон, почту для заказавшего) - обычно это protector
// ======================================================
export const PROTECTED_USER_PROP_TYPE_MAP = {
  ...PUBLIC_USER_PROP_TYPE_MAP,
  firstName: PropTypes.string,
  middleName: PropTypes.string,
  lastName: PropTypes.string,
  email: PropTypes.string,
  phone: PropTypes.string,
  address: PropTypes.string,
};
export const PROTECTED_USER_PROP_TYPE = PropTypes.shape(PROTECTED_USER_PROP_TYPE_MAP);
export const DEFAULT_PROTECTED_USER = {
  ...DEFAULT_PUBLIC_USER,
  firstName: '',
  middleName: '',
  lastName: '',
  email: undefined,
  phone: undefined,
  address: undefined,
};

// данные берутся из \src\stub\server\models\credentials.js
export const USER_PROP_TYPE_MAP = {
  // ======================================================
  // PUBLIC
  // ======================================================
  // userId: PropTypes.string,
  // // profileImageURI: PropTypes.string, // не передаем, для этого есть метод front-core\src\common\app-redux\reducers\app\users.js::getUserAvatarUrl(userIdOrAliasId)
  // aliasId: PropTypes.string,
  // displayName: PropTypes.string,
  // computedDisplayName: PropTypes.string,
  // description: PropTypes.string,

  // ======================================================
  // PROTECTED
  // ======================================================
  // firstName: PropTypes.string,
  // middleName: PropTypes.string,
  // lastName: PropTypes.string,
  // phone: PropTypes.string,
  // address: PropTypes.string,
  // email: PropTypes.string,
  ...PROTECTED_USER_PROP_TYPE_MAP,

  // ======================================================
  // OTHER
  // ======================================================
  username: PropTypes.string,
  userType: PropTypes.string,

  provider: PropTypes.string,
  providerScopes: PropTypes.arrayOf(PropTypes.string),
  providerData: PropTypes.object,

  created: PropTypes.string,
  updated: PropTypes.string,
  comment: PropTypes.string,

  roles: PropTypes.arrayOf(PropTypes.string),
  permissions: PropTypes.arrayOf(PropTypes.string),
  // scope: PropTypes.string,

  contextData: PropTypes.object,
};
export const USER_PROP_TYPE = PropTypes.shape(USER_PROP_TYPE_MAP);
export const USER_DEFAULT_VALUES = {
  ...DEFAULT_PROTECTED_USER,
  userId: undefined,
  username: undefined,
  userType: undefined,

  provider: undefined,
  providerScopes: [],
  providerData: {},

  created: undefined,
  updated: undefined,
  comment: undefined,

  roles: [],
  permissions: [],
  // scope: undefined,

  contextData: {},
};

// ======================================================
// EDITABLE FIELDS
// ======================================================
export const PUBLIC_EDITABLE_ATTRS = [
  'username',
  'aliasId',
  'email',
  'firstName',
  'lastName',
  'middleName',
  'displayName',
  'phone',
  'address',
  'description',
  'comment',
  'profileImageURI',
  'contextData',
];

export default USER_PROP_TYPE;
