function pluginFileFont(webpackConfig, {
  ASSETS_BASE_QUERY
}) {
  [
    ['woff', 'application/font-woff'],
    ['woff2', 'application/font-woff2'],
    ['otf', 'font/opentype'],
    ['ttf', 'application/octet-stream'],
    ['eot', 'application/vnd.ms-fontobject']
  ].forEach((font) => {
    const extension = font[0];
    const mimetype = font[1];

    webpackConfig.module.rules.push({
      test: new RegExp(`\\.${extension}$`),
      loader: 'url-loader',
      options: Object.assign(
        {},
        ASSETS_BASE_QUERY,
        {
          mimetype
        }
      )
    });
  });
}

module.exports = pluginFileFont;
