/**
 * accessPublic - все у кого есть ссылка
 * accessAuth - только авторизованные пользователи
 * accessOwnerOnly - только тот, кто создал (ну и админ ;))
 * [<other string>] - пермишен специальный
 */
export default {
  ACCESS_PUBLIC: 'accessPublic',
  ACCESS_AUTH: 'accessAuth',
  ACCESS_OWNER_ONLY: 'accessOwnerOnly',
};
