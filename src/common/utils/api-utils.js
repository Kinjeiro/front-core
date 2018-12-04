/* eslint-disable no-param-reassign */
import FileSaver from 'file-saver';
import { applyPatch } from 'fast-json-patch';

import {
  wrapToArray,
} from './common';
import apiConfig from './create-api-config';

// https://tools.ietf.org/html/rfc6902
export const PATCH_OPERATIONS = {
  REPLACE: 'replace',
  ADD: 'add',
  REMOVE: 'remove',
};
// export const ADD_AS_LAST = '-';
export const ADD_AS_LAST = '-';

export const RE_DOT = /\./g;
/**
 * по умолчанию не добавляет в конец, нужно обязательно указывать позицию
   createJsonPatchOperation('/field2', 'newValue4', PATCH_OPERATIONS.ADD),
   @guide - "/-" обозначает в конец
   createJsonPatchOperation('/field2/-', 'newValue4', PATCH_OPERATIONS.ADD),
 * @param path
 * @param value
 * @param operationType
 * @param itemIds
 * @returns {{path: string, value: *, op: string}}
 */
export function createJsonPatchOperation(path, value, operationType = PATCH_OPERATIONS.REPLACE, itemIds = undefined) {
  // по стандарту вложенные объекты разделяются не точками (как в lodash.get) а слешом
  let pathFinal = Array.isArray(path) ? path.join('/') : path.replace(RE_DOT, '/');
  pathFinal = pathFinal.indexOf('/') === 0 ? pathFinal : `/${pathFinal}`;
  if (operationType === PATCH_OPERATIONS.ADD && !(/\/(-|\d+)$/g.test(pathFinal))) {
    // если в конце не указана позиция или не указан "-" - то есть в конец, то добавим
    pathFinal += `/${ADD_AS_LAST}`;
  }

  const operation = {
    path: pathFinal,
    value,
    op: operationType,
  };

  if (itemIds) {
    operation.itemIds = Array.isArray(itemIds)
      ? itemIds
      : typeof itemIds !== 'undefined'
        ? [itemIds]
        : undefined;
  }

  return operation;
}

export function isPatchOperations(patchOperations) {
  const patchOperation = wrapToArray(patchOperations)[0];
  return patchOperation && typeof patchOperation.path !== 'undefined' && typeof patchOperation.op !== 'undefined';
}

export function parseToJsonPatch(patchOperations) {
  if (Array.isArray(patchOperations)) {
    return patchOperations;
  }
  if (typeof patchOperations === 'object') {
    if (patchOperations.op) {
      return [patchOperations];
    }

    return Object.keys(patchOperations).map((field) =>
      createJsonPatchOperation(field, patchOperations[field]));
  }

  throw new Error('Not supported json patch format', patchOperations, 'See https://tools.ietf.org/html/rfc6902');
}

export function applyPatchOperations(object, patchOperations) {
  return applyPatch(object, parseToJsonPatch(patchOperations)).newDocument;
}

// нужен чтобы при повторных проходах, не учитывать уже заменненые значения
const SPECIAL_DELIMITER = '{';
const SPECIAL_DELIMITER_REGEXP = new RegExp(SPECIAL_DELIMITER, 'g');

export function replacePathIndexToItemId(operation, saveItemIds = false) {
  if (operation.itemIds) {
    const {
      path,
      value,
      op,
      itemIds,
    } = operation;

    const resultPath = itemIds.reduce((result, itemId) =>
      result.replace(/\/(\d+)(\/|$)/, `/${SPECIAL_DELIMITER}${itemId}${SPECIAL_DELIMITER}$2`,
    ), path)
      .replace(SPECIAL_DELIMITER_REGEXP, '');

    // const regExp = /\/(\d+)(\/|$)/g;
    // let resultPath = '';
    // let lastPosition = 0;
    // let arrayIndex = 0;
    // let res;
    // // eslint-disable-next-line no-cond-assign
    // while ((res = regExp.exec(path)) !== null) {
    //   const indexPart = res[1];
    //   const rightPart = res[2];
    //   const isLast = regExp.lastIndex === path.length;
    //   const leftPart = path.substr(
    //     lastPosition,
    //     regExp.lastIndex - `${indexPart}`.length - lastPosition - (isLast ? 0 : 1),
    //   );
    //   // eslint-disable-next-line no-plusplus
    //   const itemId = itemIds[arrayIndex++];
    //   // resultPath = `${resultPath}${leftPart}${itemId}${dotOrEnd}`;
    //   resultPath = `${resultPath}${leftPart}${itemId}`;
    //
    //   if (isLast) {
    //     resultPath = `${resultPath}${rightPart}`;
    //   }
    //
    //   // смешаем на один назад, так как слеш является как концом первого, так иначалом второго
    //   regExp.lastIndex = regExp.lastIndex - 1;
    //   lastPosition = regExp.lastIndex;
    // }

    // убираем itemByIds
    const resultOperation = {
      op,
      path: resultPath,
      value,
    };

    if (saveItemIds) {
      resultPath.itemIds = itemIds;
    }

    return resultOperation;
  }
  return operation;
}


// todo @ANKU @LOW - может вынести это куда или либу скачать?
// todo @ANKU @LOW - либо сделать через sugnature - первые 4 байта контента
// https://medium.com/the-everyday-developer/detect-file-mime-type-using-magic-numbers-and-javascript-16bc513d4e1e
// https://github.com/leahciMic/file-signature/blob/master/file-signature.js
const EXT_TYPES = {
  '3gp': 'video/3gpp',
  a: 'application/octet-stream',
  ai: 'application/postscript',
  aif: 'audio/x-aiff',
  aiff: 'audio/x-aiff',
  asc: 'application/pgp-signature',
  asf: 'video/x-ms-asf',
  asm: 'text/x-asm',
  asx: 'video/x-ms-asf',
  atom: 'application/atom+xml',
  au: 'audio/basic',
  avi: 'video/x-msvideo',
  bat: 'application/x-msdownload',
  bin: 'application/octet-stream',
  bmp: 'image/bmp',
  bz2: 'application/x-bzip2',
  c: 'text/x-c',
  cab: 'application/vnd.ms-cab-compressed',
  cc: 'text/x-c',
  chm: 'application/vnd.ms-htmlhelp',
  class: 'application/octet-stream',
  com: 'application/x-msdownload',
  conf: 'text/plain',
  cpp: 'text/x-c',
  crt: 'application/x-x509-ca-cert',
  css: 'text/css',
  csv: 'text/csv',
  cxx: 'text/x-c',
  deb: 'application/x-debian-package',
  der: 'application/x-x509-ca-cert',
  diff: 'text/x-diff',
  djv: 'image/vnd.djvu',
  djvu: 'image/vnd.djvu',
  dll: 'application/x-msdownload',
  dmg: 'application/octet-stream',

  // MS OFFICE
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  dotx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
  docm: 'application/vnd.ms-word.document.macroEnabled.12',
  dotm: 'application/vnd.ms-word.template.macroEnabled.12',
  xls: ' application/vnd.ms-excel',
  xlt: ' application/vnd.ms-excel',
  xla: ' application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xltx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
  xlsm: 'application/vnd.ms-excel.sheet.macroEnabled.12',
  xltm: 'application/vnd.ms-excel.template.macroEnabled.12',
  xlam: 'application/vnd.ms-excel.addin.macroEnabled.12',
  xlsb: 'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
  ppt: ' application/vnd.ms-powerpoint',
  pot: ' application/vnd.ms-powerpoint',
  pps: ' application/vnd.ms-powerpoint',
  ppa: ' application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  potx: 'application/vnd.openxmlformats-officedocument.presentationml.template',
  ppsx: 'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
  ppam: 'application/vnd.ms-powerpoint.addin.macroEnabled.12',
  pptm: 'application/vnd.ms-powerpoint.presentation.macroEnabled.12',
  potm: 'application/vnd.ms-powerpoint.template.macroEnabled.12',
  ppsm: 'application/vnd.ms-powerpoint.slideshow.macroEnabled.12',
  mdb: 'application/vnd.ms-access',





  dot: 'application/msword',
  dtd: 'application/xml-dtd',
  dvi: 'application/x-dvi',
  ear: 'application/java-archive',
  eml: 'message/rfc822',
  eps: 'application/postscript',
  exe: 'application/x-msdownload',
  f: 'text/x-fortran',
  f77: 'text/x-fortran',
  f90: 'text/x-fortran',
  flv: 'video/x-flv',
  for: 'text/x-fortran',
  gem: 'application/octet-stream',
  gemspec: 'text/x-script.ruby',
  gif: 'image/gif',
  gz: 'application/x-gzip',
  h: 'text/x-c',
  hh: 'text/x-c',
  htm: 'text/html',
  html: 'text/html',
  ico: 'image/vnd.microsoft.icon',
  ics: 'text/calendar',
  ifb: 'text/calendar',
  iso: 'application/octet-stream',
  jar: 'application/java-archive',
  java: 'text/x-java-source',
  jnlp: 'application/x-java-jnlp-file',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  js: 'application/javascript',
  json: 'application/json',
  log: 'text/plain',
  m3u: 'audio/x-mpegurl',
  m4v: 'video/mp4',
  man: 'text/troff',
  mathml: 'application/mathml+xml',
  mbox: 'application/mbox',
  mdoc: 'text/troff',
  me: 'text/troff',
  mid: 'audio/midi',
  midi: 'audio/midi',
  mime: 'message/rfc822',
  mml: 'application/mathml+xml',
  mng: 'video/x-mng',
  mov: 'video/quicktime',
  mp3: 'audio/mpeg',
  mp4: 'video/mp4',
  mp4v: 'video/mp4',
  mpeg: 'video/mpeg',
  mpg: 'video/mpeg',
  ms: 'text/troff',
  msi: 'application/x-msdownload',
  odp: 'application/vnd.oasis.opendocument.presentation',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  odt: 'application/vnd.oasis.opendocument.text',
  ogg: 'application/ogg',
  p: 'text/x-pascal',
  pas: 'text/x-pascal',
  pbm: 'image/x-portable-bitmap',
  pdf: 'application/pdf',
  pem: 'application/x-x509-ca-cert',
  pgm: 'image/x-portable-graymap',
  pgp: 'application/pgp-encrypted',
  pkg: 'application/octet-stream',
  pl: 'text/x-script.perl',
  pm: 'text/x-script.perl-module',
  png: 'image/png',
  pnm: 'image/x-portable-anymap',
  ppm: 'image/x-portable-pixmap',
  ps: 'application/postscript',
  psd: 'image/vnd.adobe.photoshop',
  py: 'text/x-script.python',
  qt: 'video/quicktime',
  ra: 'audio/x-pn-realaudio',
  rake: 'text/x-script.ruby',
  ram: 'audio/x-pn-realaudio',
  rar: 'application/x-rar-compressed',
  rb: 'text/x-script.ruby',
  rdf: 'application/rdf+xml',
  roff: 'text/troff',
  rpm: 'application/x-redhat-package-manager',
  rss: 'application/rss+xml',
  rtf: 'application/rtf',
  ru: 'text/x-script.ruby',
  s: 'text/x-asm',
  sgm: 'text/sgml',
  sgml: 'text/sgml',
  sh: 'application/x-sh',
  sig: 'application/pgp-signature',
  snd: 'audio/basic',
  so: 'application/octet-stream',
  svg: 'image/svg+xml',
  svgz: 'image/svg+xml',
  swf: 'application/x-shockwave-flash',
  t: 'text/troff',
  tar: 'application/x-tar',
  tbz: 'application/x-bzip-compressed-tar',
  tcl: 'application/x-tcl',
  tex: 'application/x-tex',
  texi: 'application/x-texinfo',
  texinfo: 'application/x-texinfo',
  text: 'text/plain',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  torrent: 'application/x-bittorrent',
  tr: 'text/troff',
  txt: 'text/plain',
  vcf: 'text/x-vcard',
  vcs: 'text/x-vcalendar',
  vrml: 'model/vrml',
  war: 'application/java-archive',
  wav: 'audio/x-wav',
  wma: 'audio/x-ms-wma',
  wmv: 'video/x-ms-wmv',
  wmx: 'video/x-ms-wmx',
  wrl: 'model/vrml',
  wsdl: 'application/wsdl+xml',
  xbm: 'image/x-xbitmap',
  xhtml: 'application/xhtml+xml',
  xml: 'application/xml',
  xpm: 'image/x-xpixmap',
  xsl: 'application/xml',
  xslt: 'application/xslt+xml',
  yaml: 'text/yaml',
  yml: 'text/yaml',
  zip: 'application/zip',
};

export function getExt(path) {
  const i = path.lastIndexOf('.');
  return (i < 0) ? '' : path.substr(i + 1);
}

export function getContentType(ext) {
  return EXT_TYPES[ext.toLowerCase()] || 'application/octet-stream';
}


export function downloadFile(blob, fileName, type = null) {
  type = type || fileName ? getContentType(getExt(fileName)) : 'application/octet-stream';
  // eslint-disable-next-line no-undef
  if (!(blob instanceof Blob)) {
    // eslint-disable-next-line no-undef
    blob = new Blob([blob], { type });
  }


  // const byteArray = new Uint8Array(content);
  // // now that we have the byte array, construct the blob from it
  // const blob1 = new Blob([byteArray], { type: 'application/octet-stream' });
  // const blob2 = new Blob([content], { type: 'application/octet-stream' });
  // FileSaver.saveAs(blob2, fileName);

  // const file = new Blob(
  //   [content],
  //   {
  //     type: type || fileName ? getContentType(getExt(fileName)) : 'application/octet-stream',
  //     // type: 'application/octet-stream',
  //   },
  // );

  // 1
  FileSaver.saveAs(blob, fileName);


  // 2
  // const objectUrl = URL.createObjectURL(file);
  // window.open(objectUrl);

  // 3
  // const blob = new Blob([content], {type: "octet/stream"});
  // const blob = new Blob([content], {type: 'image/jpeg'});
  // if (window.navigator.msSaveOrOpenBlob) {
  //   window.navigator.msSaveOrOpenBlob(blob, fileName);
  // } else {
  //   const a = document.createElement('a');
  //   document.body.appendChild(a);
  //   const url = window.URL.createObjectURL(blob);
  //   a.href = url;
  //   a.download = fileName;
  //   a.click();
  //   setTimeout(() => {
  //     window.URL.revokeObjectURL(url);
  //     document.body.removeChild(a);
  //   }, 0);
  // }

  // let anchor = document.createElement("a");
  // let file = 'https://www.example.com/some-file.pdf';
  // let headers = new Headers();
  // headers.append('Authorization', 'Bearer MY-TOKEN');
  // fetch(file, { headers })
  //   .then(response => response.blob())
  //   .then(blobby => {
  //     let objectUrl = window.URL.createObjectURL(blobby);
  //
  //     anchor.href = objectUrl;
  //     anchor.download = 'some-file.pdf';
  //     anchor.click();
  //
  //     window.URL.revokeObjectURL(objectUrl);
  //   });


  // // const blobby = response.blob();
  // let objectUrl = window.URL.createObjectURL(blob);
  //
  // let anchor = document.createElement("a");
  // anchor.href = objectUrl;
  // anchor.download = fileName;
  // anchor.click();
  // window.URL.revokeObjectURL(objectUrl);
  return Promise.resolve(blob);
}

export function downloadText(text, fileName = null) {
  return downloadFile(text, fileName || `${text.substr(0, Math.min(10, text.length))}.txt`, 'text/plain;charset=utf-8');
}

export function downloadFileFromResponse(response, fileName) {
  return downloadFile(response.data || response.text, fileName, response.type);
}

export const DEFAULT_FILES_PARAM_NAME = 'file';

export function convertToFormData(params = {}, filesMap = {}, options) {
  const {
    fieldFile = DEFAULT_FILES_PARAM_NAME,
  } = options;

  let filesMapFinal = filesMap;
  // файл - это мапа, нужно проверить если это собственно файл - его нужно в массив обернгуть
  if (typeof filesMapFinal !== 'object' || filesMapFinal instanceof File) {
    const files = wrapToArray(filesMapFinal);
    filesMapFinal = {};
    filesMapFinal[fieldFile] = files;
  }

  const formData = new FormData();

  Object.keys(params).forEach((paramKey) => {
    formData.append(paramKey, params[paramKey]);
  });

  Object.keys(filesMapFinal).forEach((fileField) => {
    const files = wrapToArray(filesMapFinal[fileField]);
    files.forEach((file) =>
      // formData.append(`${fileField}[]`, file, file.name));
      formData.append(`${fileField}`, file, file.name));
  });

  return formData;
}

/**
 *
 * @param API_PREFIX
 * @param sendApiFn
 * @param options
 * @return {{
 * API_PREFIX: *,
 * API_CONFIGS: {
 *  loadRecords: ({method, path, payload}|*),
 *  createRecord: ({method, path, payload}|*),
 *  readRecord: ({method, path, payload}|*),
 *  updateRecord: ({method, path, payload}|*),
 *  patchRecord: ({method, path, payload}|*),
 *  deleteRecord: ({method, path, payload}|*)},
 *
 *  apiLoadRecords: (function(*=, *=): *),
 *  apiCreateRecord: (function(*=, *=): *),
 *  apiReadRecord: (function(*): *),
 *  apiUpdateRecord: (function(*, *=): *),
 *  apiPatchRecord: (function(*, *=): *),
 *  apiDeleteRecord: (function(*): *)}}
 */
export function createCrudApi(API_PREFIX, sendApiFn, options = {}) {
  const {
    isFormDataOnCreate,
  } = options || {};

  const API_CONFIGS = {
    loadRecords: apiConfig(`/${API_PREFIX}`, 'GET'),

    createRecord: apiConfig(`/${API_PREFIX}`, 'POST'),
    readRecord: apiConfig(`/${API_PREFIX}/{id}`, 'GET'),
    updateRecord: apiConfig(`/${API_PREFIX}/{id}`, 'PUT'),
    deleteRecord: apiConfig(`/${API_PREFIX}/{id}`, 'DELETE'),

    patchRecord: apiConfig(`/${API_PREFIX}/{id}`, 'PATCH'),
  };

  function apiLoadRecords(meta = null, filters = null) {
    return sendApiFn(API_CONFIGS.loadRecords, {
      // мета передаем от рута, а вот все остальные фильтры от объекта filters
      ...meta,
      filters,
    });
  }

  /**
   *
   * @param data
   * @param filesMap - может быть File, массивом File, либо мапой <имя поля>: File|[...File]
   * @return {*}
   */
  function apiCreateRecord(data, filesMap = null) {
    if (isFormDataOnCreate || filesMap !== null) {
      // если передается даже пустая мапа - это говорит, что использовать механизм formData
      data = convertToFormData(data, filesMap);
    }
    return sendApiFn(API_CONFIGS.createRecord, data);
  }
  function apiReadRecord(id) {
    return sendApiFn(API_CONFIGS.readRecord, null, { pathParams: { id } });
  }
  function apiUpdateRecord(id, changedData) {
    return sendApiFn(API_CONFIGS.updateRecord, changedData, { pathParams: { id } });
  }
  function apiPatchRecord(id, patchOperations) {
    return sendApiFn(API_CONFIGS.patchRecord, patchOperations, { pathParams: { id } });
  }
  function apiDeleteRecord(id) {
    return sendApiFn(API_CONFIGS.deleteRecord, null, { pathParams: { id } });
  }

  return {
    API_PREFIX,
    API_CONFIGS,
    apiLoadRecords,
    apiCreateRecord,
    apiReadRecord,
    apiUpdateRecord,
    apiDeleteRecord,
    apiPatchRecord,
  };
}

export async function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

export function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
}
