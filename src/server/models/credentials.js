// их парсинг происходит в \src\server\strategies\user-info\default.js

export default class CredentialsModel {
  // практически соответствует модели \src\common\models\user-info.js
  /*
  {
    username,
    permissions
  }
  */
  userInfo;
  /** любые контекстные данные при запуске приложения */
  contextData;

  constructor(userInfo, contextData) {
    this.userInfo = userInfo;
    this.contextData = contextData;
  }

  isAuth() {
    return !!this.userInfo;
  }
  checkSimplePermission(permission) {
    return this.userInfo && this.userInfo.permissions.includes(permission);
  }
  getUserName() {
    return this.isAuth()
      ? this.userInfo.username || this.userInfo.email
      : undefined;
  }
}

export const EMPTY = new CredentialsModel();
