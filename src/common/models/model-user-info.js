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
  scope: '*',
};
 */

// данные берутся из \src\stub\server\models\credentials.js
export const USER_INFO_PROP_TYPE_MAP = {
  userId: PropTypes.string,
  username: PropTypes.string,
  userType: PropTypes.string,
  email: PropTypes.string,

  firstName: PropTypes.string,
  middleName: PropTypes.string,
  lastName: PropTypes.string,
  displayName: PropTypes.string,
  phone: PropTypes.string,
  address: PropTypes.string,
  // profileImageURI: PropTypes.string,
  aliasId: PropTypes.string,

  provider: PropTypes.string,
  providerScopes: PropTypes.arrayOf(PropTypes.string),
  providerData: PropTypes.object,

  created: PropTypes.string,
  updated: PropTypes.string,

  roles: PropTypes.arrayOf(PropTypes.string),
  permissions: PropTypes.arrayOf(PropTypes.string),
  // scope: PropTypes.string,

  contextData: PropTypes.object,
};

export const USER_INFO_DEFAULT_VALUES = {
  userId: undefined,
  username: undefined,
  userType: undefined,

  firstName: '',
  middleName: '',
  lastName: '',
  displayName: '',
  email: undefined,
  phone: undefined,
  address: undefined,
  aliasId: undefined,
  // profileImageURI: undefined,

  provider: undefined,
  providerScopes: [],
  providerData: {},

  created: undefined,
  updated: undefined,

  roles: [],
  permissions: [],
  // scope: undefined,

  contextData: {},
};

export const USER_INFO_PROP_TYPE = PropTypes.shape(USER_INFO_PROP_TYPE_MAP);

export default USER_INFO_PROP_TYPE;

