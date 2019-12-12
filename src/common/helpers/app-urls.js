import {
  joinPath,
  getModuleRoutePath,
  formatUrlParameters, isAbsoluteUrl,
} from '../utils/uri-utils';
import config from '../client-config';

/**
 * осторожно!!! contextPath (basename) уже учитывается во всех роутингах, дополнительно в path его задавать не нужно. Поэтому пользуйтесь аккуратно
 * учитывает contextPath (basepath) приложения
*/
export function appUrl(pathname, ...otherPaths) {
  let resultUrl = pathname || '';

  if (!isAbsoluteUrl(resultUrl)) {
    resultUrl = joinPath('/', resultUrl);

    const contextPath = joinPath('/', config.common.app.contextRoot);

    if (resultUrl.indexOf(contextPath) < 0) {
      // если впереди нету contextPath - добавим его
      resultUrl = joinPath(contextPath, resultUrl);
    }
  }

  const lastUrlParameters = otherPaths && otherPaths[otherPaths.length - 1];
  if (typeof lastUrlParameters === 'object') {
    // url parameters
    return formatUrlParameters(
      lastUrlParameters,
      joinPath(resultUrl, ...otherPaths.slice(0, otherPaths.length - 1)),
    );
  }

  return joinPath(resultUrl, ...otherPaths);
}

export function testAppUrlStartWith(pathname, ...testUrls) {
  return testUrls.some((testUri) => joinPath(pathname, '/').indexOf(joinPath('/', testUri, '/')) === 0);
}

export function cutHost(requestPath) {
  /*
    RFC 3986 ( http://www.ietf.org/rfc/rfc3986.txt ) says in Appendix B

    The following line is the regular expression for breaking-down a well-formed URI reference into its components.

      ^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?
       12            3  4          5       6  7        8 9
    The numbers in the second line above are only to assist readability; they indicate the reference points for each subexpression (i.e., each paired parenthesis). We refer to the value matched for subexpression as $. For example, matching the above expression to

      http://www.ics.uci.edu/pub/ietf/uri/#Related
    results in the following subexpression matches:

      $1 = http:
      $2 = http
      $3 = //www.ics.uci.edu
      $4 = www.ics.uci.edu
      $5 = /pub/ietf/uri/
      $6 = <undefined>
      $7 = <undefined>
      $8 = #Related
      $9 = Related
    where <undefined> indicates that the component is not present, as is the case for the query component in the above example. Therefore, we can determine the value of the five components as

      scheme    = $2
      authority = $4
      path      = $5
      query     = $7
      fragment  = $9
  */
  return isAbsoluteUrl(requestPath)
    ? requestPath.match(
      /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/,
      5 - 1,
    )
    : requestPath;
}


export function cutContextPath(requestPath) {
  const requestPathFinal = cutHost(requestPath);
  const contextPath = config.common.app.contextRoot;
  return contextPath && contextPath !== '/'
    ? requestPathFinal.replace(new RegExp(`^${joinPath('/', contextPath).replace(/\//gi, '\\/')}`, 'gi'), '')
    // на всякий случай проверяем если впереди /
    : joinPath('/', requestPathFinal);
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
