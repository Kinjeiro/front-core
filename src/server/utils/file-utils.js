// todo @ANKU @LOW @BUG_OUT @babel - никак не хочет компилиться правильно, только если отключить polyfills
// https://github.com/babel/babel/issues/2877
export * from '../../../build-scripts/utils/file-utils';

export function base64ToBuffer(base64Url, fileName = null) {
  let buffer = null;
  const headers = {};
  if (fileName) {
    headers['content-disposition'] = `attachment; filename=${encodeURI(fileName)};`;
  }

  if (Buffer.isBuffer(base64Url)) {
    buffer = base64Url;
  } else if (typeof base64Url === 'string') {
    // если data:image base64
    // data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPAAAAE
    const parts = base64Url.match(/data:(.*);base64,(.*)/i);
    if (parts && parts[0]) {
      // eslint-disable-next-line no-param-reassign
      const type = parts[1];
      buffer = Buffer.from(parts[2], 'base64');

      headers['Content-Type'] = type;
      headers['Content-Length'] = buffer.length;
    } else {
      // может из response понять что это идет контент
      buffer = Buffer.from(base64Url, 'base64');
    }
  }

  return buffer
    ? {
      buffer,
      headers,
    }
    : null;
}

export function streamToString(stream, notParseToUtf = false) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => {
      let result = Buffer.concat(chunks);
      if (!notParseToUtf) {
        result = result.toString('utf8');
      }
      resolve(result);
    });
  });
}
