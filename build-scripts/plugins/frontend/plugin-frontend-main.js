/* eslint-disable no-param-reassign */
// const ManifestPlugin = require('webpack-manifest-plugin');

const { urlJoin } = require('../../utils/path-utils');

function pluginFrontendMain(webpackConfig, webpackContext) {
  const {
    appConfig,
    isLocalhost,
    publicPath,
    assetsDir,
    clientStartPath, // './src/client/index.js'
    inProject,
    inProjectBuild
  } = webpackContext;

  // \src\common\routes.pathes.js::ASSETS
  // const PROXY_ASSETS = isLocalhost && appConfig.server.main.proxyAssets;

  if (!webpackConfig.entry.index) {
    webpackConfig.entry.index = [];
  }
  webpackConfig.entry.index.push(clientStartPath);

  /*
    Template	Description
    [hash]       - The hash of the module identifier
    [chunkhash]  - The hash of the chunk content
    [name]       - The module name
    [id]         - The module identifier
    [query]      - The module query, i.e., the string following ? in the filename

  Note this options does not affect output files for on-demand-loaded chunks.
  For these files the output.chunkFilename option is used.
  It also doesn't affect files created by loaders. For these files see loader options.
  */
  webpackConfig.output.filename = `${assetsDir}/[name].js`;
  // webpackConfig.output.filename = `${assetsDir}/[name].[contenthash].js`;
  // webpackConfig.output.filename = `${assetsDir}/[name].[chunkhash].js`;

  // todo @ANKU @LOW @BUG_OUT @webpack - динамически чанки через import \ require.ensure подключаются просто тупым сложением publicPath + chunkFilename без нормализации
  // <script type="text/javascript" charset="utf-8" async="" src="\./assets/0.js"></script>
  // webpackConfig.output.chunkFilename = './' + assetsDir + '/[name].js';
  webpackConfig.output.chunkFilename = `${assetsDir}/[name].js`;

  /*
   The output directory as an absolute path.

   path: path.resolve(__dirname, 'dist/assets')
   Note that [hash] in this parameter will be replaced with an hash of the compilation. See the Caching guide for details.
  */
  webpackConfig.output.path = inProjectBuild();

  // webpackConfig.output.path = PROXY_ASSETS
  //   ? inProjectBuild()
  //   : inProjectBuild(assetsDir);

  /*
   https://webpack.js.org/configuration/output/#output-publicpath
   This is an important option when using on-demand-loading or loading external resources like images, files, etc. If an incorrect value is specified you'll receive 404 errors while loading these resources.
   This option specifies the public URL of the output directory when referenced in a browser. A relative URL is resolved relative to the HTML page (or <base> tag). Server-relative URLs, protocol-relative URLs or absolute URLs are also possible and sometimes required, i. e. when hosting assets on a CDN.
   The value of the option is prefixed to every URL created by the runtime or loaders. Because of this the value of this option ends with / in most cases.
   The default value is an empty string "".
   Simple rule: The URL of your output.path from the view of the HTML page.

   path: path.resolve(__dirname, "public/assets"),
   publicPath: "https://cdn.example.com/assets/"
   For this configuration:

   publicPath: "/assets/",
   chunkFilename: "[id].chunk.js"
   A request to a chunk will look like /assets/4.chunk.js.

   A loader outputting HTML might emit something like this:

   <link href="/assets/spinner.gif" />
   or when loading an image in CSS:

   background-image: url(/assets/spinner.gif);
   The webpack-dev-server also takes a hint from publicPath, using it to determine where to serve the output files from.

   Note that [hash] in this parameter will be replaced with an hash of the compilation. See the Caching guide for details.

   Examples:

   publicPath: "https://cdn.example.com/assets/", // CDN (always HTTPS)
   publicPath: "//cdn.example.com/assets/", // CDN (same protocol)
   publicPath: "/assets/", // server-relative
   publicPath: "assets/", // relative to HTML page
   publicPath: "../assets/", // relative to HTML page
   publicPath: "", // relative to HTML page (same directory)
   In cases where the publicPath of output files can't be known at compile time, it can be left blank and set dynamically at runtime in the entry file using the free variable __webpack_public_path__.

   __webpack_public_path__ = myRuntimePublicPath

   // rest of your application entry
   See this discussion for more information on __webpack_public_path__.
  */

  // проксируется на ноде на 9090 (webpack dev server)
  webpackConfig.output.publicPath =
    // PROXY_ASSETS
    // ? `//${PROXY_ASSETS.host}:${PROXY_ASSETS.port}${urlJoin('/', publicPath)}`
    // : urlJoin('/', publicPath);
    urlJoin('/', publicPath);

  // webpackConfig.plugins.push(
  //   // https://www.npmjs.com/package/webpack-manifest-plugin#optionsfilename
  //   // чтобы hashcontent узнать при ejs темплейтинге - сохраняет файл в билде manifest.json
  //   new ManifestPlugin(),
  // );
}

module.exports = pluginFrontendMain;
