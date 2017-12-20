/*
  Файл - единая точка работы с credentials, просто обертка для единообразия и понимания где хранятся credentials на сервере
*/
// todo @ANKU @CRIT @MAIN - Typescript
import { EMPTY } from '../models/credentials';

export function continueWithCredentials(reply, credentials) {
  return reply.continue({
    credentials: credentials || EMPTY,
  });
}
export function continueWithoutCredentials(reply, uniError = null) {
  return continueWithCredentials(reply, uniError);
}

export function getCredentialsFromRequest(apiRequest) {
  const credentials = apiRequest.auth && apiRequest.auth.credentials;
  return credentials && !credentials.isUniError
    ? credentials
    : EMPTY;
}

export function getAuthUniErrorFromRequest(apiRequest) {
  const credentials = apiRequest.auth && apiRequest.auth.credentials;
  return credentials && credentials.isUniError
    ? credentials
    : null;
}

export function isAuthenticated(request) {
  return getCredentialsFromRequest(request).isAuth();
}
