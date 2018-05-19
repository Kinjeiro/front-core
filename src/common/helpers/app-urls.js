import {
  joinUri,
  formatUrlParameters,
} from '../utils/uri-utils';
import config from '../client-config';

const contextPath = config.common.app.contextRoot;

/**
 * осторожно!!! contextPath (basename) уже учитывается во всех роутингах, дополнительно не нужно. Поэтому пользуйтесь аккуратно
* учитывает contextPath (basepath) приложения
*/
export function appUrl(pathname = '', ...otherPaths) {
  let resultUrl = pathname;
  if (resultUrl.indexOf(contextPath) < 0 && resultUrl.indexOf(`/${contextPath}`) < 0) {
    resultUrl = joinUri(contextPath, resultUrl);
  }

  const lastUrlParameters = otherPaths && otherPaths[otherPaths.length - 1];
  if (typeof lastUrlParameters === 'object') {
    // url parameters
    return formatUrlParameters(
      lastUrlParameters,
      joinUri('/', resultUrl, ...otherPaths.slice(0, otherPaths.length - 1)),
    );
  }

  return joinUri('/', resultUrl, ...otherPaths);
}

export function testAppUrlStartWith(pathname, ...testUrls) {
  const url = appUrl(pathname);
  return testUrls.some((testUri) => url.indexOf(appUrl(testUri)) >= 0);
}

export default appUrl;
