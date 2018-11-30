// их парсинг происходит в \src\server\strategies\user-info\default.js
import { checkAccess } from '../../modules/module-auth/common/subModule/helpers/access-object-utils';

export default class CredentialsModel {
  // практически соответствует модели \src\common\models\user-info.js
  /*
  {
    userId,
    username,
    email,
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
  checkSimplePermission(accessObject) {
    // todo @ANKU @CRIT @MAIN @HACK - будем переделывать систему прав и тогда разнесем permissions и roles
    return checkAccess(this.userInfo, accessObject);
    // return this.userInfo
    //   && (
    //     this.userInfo.permissions.includes(accessObject)
    //     || this.userInfo.roles.includes(accessObject)
    //   );
  }
  getUserName() {
    return this.isAuth()
      ? this.userInfo.username || this.userInfo.email
      : undefined;
  }
}

export const EMPTY = new CredentialsModel();
