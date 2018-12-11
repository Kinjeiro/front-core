import {
  joinPath,
  getModuleRoutePath,
  formatUrlParameters,
} from '../utils/uri-utils';
import config from '../client-config';

/**
 * осторожно!!! contextPath (basename) уже учитывается во всех роутингах, дополнительно в path его задавать не нужно. Поэтому пользуйтесь аккуратно
 * учитывает contextPath (basepath) приложения
*/
export function appUrl(pathname, ...otherPaths) {
  const contextPath = joinPath('/', config.common.app.contextRoot);
  let resultUrl = pathname || '';
  if (resultUrl.indexOf(contextPath) < 0) {
    // если впереди нету contextPath - добавим его
    resultUrl = joinPath(contextPath, resultUrl);
  }

  const lastUrlParameters = otherPaths && otherPaths[otherPaths.length - 1];
  if (typeof lastUrlParameters === 'object') {
    // url parameters
    return formatUrlParameters(
      lastUrlParameters,
      joinPath('/', resultUrl, ...otherPaths.slice(0, otherPaths.length - 1)),
    );
  }

  return joinPath('/', resultUrl, ...otherPaths);
}

export function testAppUrlStartWith(pathname, ...testUrls) {
  return testUrls.some((testUri) => pathname.indexOf(joinPath('/', testUri)) === 0);
}

export function cutContextPath(requestPath) {
  const contextPath = config.common.app.contextRoot;
  return contextPath && contextPath !== '/'
    ? requestPath.replace(new RegExp(`^${joinPath('/', contextPath).replace(/\//gi, '\\/')}`, 'gi'), '')
    // на всякий случай проверяем если впереди /
    : joinPath('/', requestPath);
}

export function getFullUrl(routePath, queryParams = undefined) {
  return `${window.location.origin}${joinPath(config.common.app.contextRoot, routePath, queryParams)}`;
}

/**
 * Полный путь до ресурса с учетом префикса различных модулей и contextPath
 *
 * @param relativeLocation - LocationDescription - @see model-location.js
 * @param moduleName
 * @param modulesPrefixes - мапа: moduleName => prefix
 * @param queryParams
 * @returns {*}
 */
export function getModuleFullPath(relativeLocation, moduleName = null, modulesPrefixes = {}, queryParams = undefined) {
  return appUrl(getModuleRoutePath(relativeLocation, moduleName, modulesPrefixes, queryParams));
}

export default appUrl;
