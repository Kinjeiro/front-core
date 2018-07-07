import {
  joinUri,
  formatUrlParameters,
} from '../utils/uri-utils';
import config from '../client-config';

/**
 * осторожно!!! contextPath (basename) уже учитывается во всех роутингах, дополнительно не нужно. Поэтому пользуйтесь аккуратно
* учитывает contextPath (basepath) приложения
*/
export function appUrl(pathname = '', ...otherPaths) {
  const contextPath = joinUri('/', config.common.app.contextRoot);
  let resultUrl = pathname;
  if (resultUrl.indexOf(contextPath) < 0) {
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
  return testUrls.some((testUri) => pathname.indexOf(joinUri('/', testUri)) === 0);
}

export function cutContextPath(requestPath) {
  const contextPath = config.common.app.contextRoot;
  return contextPath && contextPath !== '/'
    ? requestPath.replace(new RegExp(`^${joinUri('/', contextPath).replace(/\//gi, '\\/')}`, 'gi'), '')
    : requestPath;
}

export default appUrl;
