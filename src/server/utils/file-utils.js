// todo @ANKU @LOW @BUG_OUT @babel - никак не хочет компилиться правильно, только если отключить polyfills
// https://github.com/babel/babel/issues/2877
export * from '../../../build-scripts/utils/file-utils';

export function base64ToBuffer(base65Url, fileName = null) {
  // если data:image base64
  // data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPAAAAE
  const parts = base65Url.match(/data:(.*);base64,(.*)/i);
  if (parts && parts[0]) {
    // eslint-disable-next-line no-param-reassign
    const type = parts[1];
    const buffer = Buffer.from(parts[2], 'base64');

    const headers = {
      'Content-Type': type,
      'Content-Length': buffer.length,
    };
    if (fileName) {
      headers['content-disposition'] = `attachment; filename=${encodeURI(fileName)};`;
    }

    return {
      buffer,
      headers,
    };
  }
  return null;
}
