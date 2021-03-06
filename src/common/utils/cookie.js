// import lodashGet from 'lodash/get';
// import lodashGet from 'lodash/get';
//
// export const getCookieValue = key => {
//  /* eslint no-useless-escape: "off" */
//  const matches = document && document.cookie.match(new RegExp(
//    '(?:^|; )' + key.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'
//  ));
//  return decodeURIComponent(lodashGet(matches, '[1]', ''));
// };

export function getCookie(name) {
  const matches = typeof document !== 'undefined' && document.cookie.match(new RegExp(
    `(?:^|; )${name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1')}=([^;]*)`,
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

export function setCookie(name, value, options = {}) {
  let expires = options.expires;

  if (typeof expires === 'number' && expires) {
    const d = new Date();
    d.setTime(d.getTime() + (expires * 1000));
    expires = options.expires = d;
  }
  if (expires && expires.toUTCString) {
    options.expires = expires.toUTCString();
  }

  value = encodeURIComponent(value);

  let updatedCookie = `${name}=${value}`;

  for (const propName in options) {
    updatedCookie += `; ${propName}`;
    const propValue = options[propName];
    if (propValue !== true) {
      updatedCookie += `=${propValue}`;
    }
  }

  if (typeof document !== 'undefined') {
    document.cookie = updatedCookie;
  }
}

export function deleteCookie(name) {
  setCookie(name, '', {
    expires: -1,
  });
}

export default getCookie;
