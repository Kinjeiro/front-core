import PropTypes from 'prop-types';

/*
{
  userId: '59c28a68b52cec41904f9848',
  username: 'ivanovI',
  userType: undefined,

  firstName: 'Ivan',
  middleName: 'Ivanovich',
  lastName: 'Ivanov',
  displayName: 'Ivanov I. I.',
  email: 'ivanovi@local.com',

  provider: 'local',

  created: '2017-09-20T15:34:00.742Z',
  updated: '2017-09-20T15:34:00.741Z',

  roles: ['user'],
  permissions: [],
  scope: '*',
};
 */

// данные берутся из \src\stub\server\models\credentials.js
export const MAP = {
  userId: PropTypes.string,
  username: PropTypes.string,
  userType: PropTypes.string,

  firstName: PropTypes.string,
  middleName: PropTypes.string,
  lastName: PropTypes.string,
  displayName: PropTypes.string,
  email: PropTypes.string,

  provider: PropTypes.string,

  created: PropTypes.string,
  updated: PropTypes.string,

  roles: PropTypes.arrayOf(PropTypes.string),
  permissions: PropTypes.arrayOf(PropTypes.string),
  scope: PropTypes.string,
};

export const DEFAULT_VALUES = {
  userId: undefined,
  username: undefined,
  userType: undefined,

  firstName: '',
  middleName: '',
  lastName: '',
  displayName: '',
  email: undefined,

  provider: undefined,

  created: undefined,
  updated: undefined,

  roles: [],
  permissions: [],
  scope: undefined,
};

export default PropTypes.shape(MAP);

