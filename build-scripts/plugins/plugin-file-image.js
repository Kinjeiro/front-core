function pluginFileImages(webpackConfig, {
  ASSETS_BASE_QUERY
}) {
  /*
   The url in url-loader has nothing to do with the url in url(...).
   The url in url-loader means DataUrl.
   Both can be applied to url(...) and require(...).
   In fact the css-loader converts url(...) into require(...).

   So for your loaders configurations you only need to decide if you want small files inlined as DataUrls (url-loader)
   or if you want every file as separate request (file-loader).
  */


  // либо испльзовать svg-inline-loader вместо url-loader

  webpackConfig.module.rules.push({
    test: /\.(ico|gif|png|jpg|jpe?g|webp|svg)$/i,
    use: [
      // 'file-loader',
      {
        loader: 'url-loader',
        options: ASSETS_BASE_QUERY
      },
      {
        // https://github.com/tcoopman/image-webpack-loader
        loader: 'image-webpack-loader',
        options: {
          /*
           Using this, no processing is done when webpack 'debug' mode is used and the loader acts as a regular file-loader.
           Use this to speed up initial and, to a lesser extent, subsequent compilations while developing or using webpack-dev-server.
           Normal builds are processed normally, outputting optimized files.
           */
          bypassOnDebug: true
        }
      }
    ]
  });

  // [
  //   ['jpeg', 'image/jpeg'],
  //   ['jpg', 'image/jpeg'],
  //   ['gif', 'image/gif'],
  //   ['png', 'image/png'],
  //   ['svg', 'image/svg+xml']
  // ].forEach((formats) => {
  //   const extension = formats[0];
  //   const mimetype = formats[1];
  //
  //   webpackConfig.module.rules.push({
  //     test: new RegExp(`\\.${extension}$`),
  //     use: [
  //       // 'file-loader?limit=10000',
  //       {
  //         loader: 'url-loader',
  //         options: Object.assign({}, ASSETS_BASE_QUERY, { mimetype })
  //       },
  //       {
  //         // https://github.com/tcoopman/image-webpack-loader
  //         loader: 'image-webpack-loader',
  //         options: {
  //           /*
  //            Using this, no processing is done when webpack 'debug' mode is used and the loader acts as a regular file-loader.
  //            Use this to speed up initial and, to a lesser extent, subsequent compilations while developing or using webpack-dev-server.
  //            Normal builds are processed normally, outputting optimized files.
  //           */
  //           bypassOnDebug: true,
  //         },
  //       },
  //     ],
  //   });
  // });
}

module.exports = pluginFileImages;
