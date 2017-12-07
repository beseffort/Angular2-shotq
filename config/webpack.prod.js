/**
 * @author: @AngularClass
 */

const envPath = './.env';
const dotenv = require('dotenv');
const fs = require('fs');
const helpers = require('./helpers');
const webpackMerge = require('webpack-merge'); // used to merge webpack configs
const commonConfig = require('./webpack.common.js'); // the settings that are common to prod and dev

const createIfNotExist = require("create-if-not-exist");
createIfNotExist(envPath, '');

/**
 * Webpack Plugins
 */
const DefinePlugin = require('webpack/lib/DefinePlugin');
const IgnorePlugin = require('webpack/lib/IgnorePlugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const NormalModuleReplacementPlugin = require('webpack/lib/NormalModuleReplacementPlugin');
const ProvidePlugin = require('webpack/lib/ProvidePlugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const WebpackMd5Hash = require('webpack-md5-hash');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const V8LazyParseWebpackPlugin = require('v8-lazy-parse-webpack-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require("compression-webpack-plugin");
/**
 * Webpack Constants
 */
const envFileObj = dotenv.parse(fs.readFileSync(envPath));
const ENV = process.env.NODE_ENV = process.env.ENV = 'production';
const HOST = process.env.HOST || envFileObj.HOST_ADDRESS || 'localhost';
const PORT = process.env.PORT || 8080;
const APICONFIG = process.env.APICONFIG = {
  'apiUrl': process.env.API_URL || envFileObj.API_URL || 'http://dev-api.shootq.io/api/v1',
  'oAuthUrl': process.env.OAUTH_URL || envFileObj.OAUTH_URL || 'http://dev-api.shootq.io',
  'account_id': 1,
  'account_username': 'ddolls',
  'account_password': 'password',
  'client_id': '3iz2kduB3pVuA0hbWNd04Jss2dAhxnORTgHYaJMb',
  'client_secret': 'd5QTixcKKk3vig8pnotaTAvtPSArNbhrYC2EeT2JLU9Wm9cnPdtsv8BgRGoGIwVd8OirIYlmeaOBgDie0vbrWb1WnrhqN4eFzonAGF2miMRUyw7UNqANQ4PjU0wMwzm6',
  'grant_type': 'password'
};
const METADATA = webpackMerge(commonConfig.metadata, {
  host: HOST,
  port: PORT,
  ENV: ENV,
  HMR: false,
  APICONFIG: APICONFIG,
});

// https://webpack.js.org/guides/code-splitting-libraries/
var moment = require('moment');
var webpack = require('webpack');
var path = require('path');
// -------------------------------------------------------

module.exports = function (env) {
  return webpackMerge(commonConfig({env: ENV}), {

    /**
     * Developer tool to enhance debugging
     *
     * See: http://webpack.github.io/docs/configuration.html#devtool
     * See: https://github.com/webpack/docs/wiki/build-performance#sourcemaps
     */
    devtool: 'source-map',

    /**
     * Options affecting the output of the compilation.
     *
     * See: http://webpack.github.io/docs/configuration.html#output
     */
    output: {

      /**
       * The output directory as absolute path (required).
       *
       * See: http://webpack.github.io/docs/configuration.html#output-path
       */
      path: helpers.root('dist'),

      /**
       * Specifies the name of each output file on disk.
       * IMPORTANT: You must not specify an absolute path here!
       *
       * See: http://webpack.github.io/docs/configuration.html#output-filename
       */
      filename: '[name].[chunkhash].bundle.js',

      /**
       * The filename of the SourceMaps for the JavaScript files.
       * They are inside the output.path directory.
       *
       * See: http://webpack.github.io/docs/configuration.html#output-sourcemapfilename
       */
      sourceMapFilename: '[name].[chunkhash].bundle.map',

      /**
       * The filename of non-entry chunks as relative path
       * inside the output.path directory.
       *
       * See: http://webpack.github.io/docs/configuration.html#output-chunkfilename
       */
      chunkFilename: '[id].[chunkhash].chunk.js'

    },

    /**
     * Add additional plugins to the compiler.
     *
     * See: http://webpack.github.io/docs/configuration.html#plugins
     */
    plugins: [
      /**
       * Webpack plugin and CLI utility that represents bundle content as convenient interactive zoomable treemap.
       */
      new BundleAnalyzerPlugin({ analyzerMode: 'static', reportFilename: 'report.html' }),
      /**
       * The AggressiveSplittingPlugin split every chunk until it reaches the specified maxSize.
       * In this example it tries to create chunks with <50kB code (after minimizing this reduces to ~10kB).
       * It groups modules together by folder structure.
       * We assume modules in the same folder as similar likely to change and minimize and gzip good together.
       *
       * @type {Number}
       */
      // See issue: https://github.com/jantimon/html-webpack-plugin/issues/446
      //
      // new webpack.optimize.AggressiveSplittingPlugin({
      //     minSize: 100000,
      //     maxSize: 240000
      // }),
      /**
       * AggressiveMergingPlugin
       *
       * @type {[type]}
       */
      new webpack.optimize.AggressiveMergingPlugin(),

      /**
       * Plugin: WebpackMd5Hash
       * Description: Plugin to replace a standard webpack chunkhash with md5.
       *
       * See: https://www.npmjs.com/package/webpack-md5-hash
       */
      new WebpackMd5Hash(),

      /**
       * Plugin: DefinePlugin
       * Description: Define free variables.
       * Useful for having development builds with debug logging or adding global constants.
       *
       * Environment helpers
       *
       * See: https://webpack.github.io/docs/list-of-plugins.html#defineplugin
       */
      // NOTE: when adding more properties make sure you include them in custom-typings.d.ts
      new DefinePlugin({
        'ENV': JSON.stringify(METADATA.ENV),
        'NODE_ENV': JSON.stringify(METADATA.ENV),
        'HMR': METADATA.HMR,
        'APICONFIG': JSON.stringify(METADATA.APICONFIG),
        'process.env': {
          'ENV': JSON.stringify(METADATA.ENV),
          'NODE_ENV': JSON.stringify(METADATA.ENV),
          'HMR': METADATA.HMR,
          'APICONFIG': JSON.stringify(METADATA.APICONFIG),
        }
      }),
      /**
       * Plugin to execute and compile less files.
       * Also used to move assets to /dist folder.
       *
       * @type {Boolean}
       */
      new WebpackShellPlugin({
        inject: false,
        safe: true,
        onBuildStart: ['cd src/app/assets/theme/; gulp dist-css;'], //execute gulp task to compile less files and generate up-to-date css files
        // create directories "app, assets & theme", then copy theme/assets to /dist/app/assets, and finally move index-styles.css to /dist
        onBuildEnd: ['mkdir dist/app; mkdir dist/app/assets; mkdir dist/app/assets/theme; cp -R src/app/assets/theme/assets dist/app/assets/theme/assets; cp src/index-styles.css dist/;']
      }),

      /**
       * Plugin: UglifyJsPlugin
       * Description: Minimize all JavaScript output of chunks.
       * Loaders are switched into minimizing mode.
       *
       * See: https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
       */
      // NOTE: To debug prod builds uncomment //debug lines and comment //prod lines
      new UglifyJsPlugin({
        // beautify: true, //debug
        // mangle: false, //debug
        // dead_code: false, //debug
        // unused: false, //debug
        // deadCode: false, //debug
        // compress: {
        //   screw_ie8: true,
        //   keep_fnames: true,
        //   drop_debugger: false,
        //   dead_code: false,
        //   unused: false
        // }, // debug
        // comments: true, //debug


        beautify: false, //prod
        output: {
          comments: false
        }, //prod
        mangle: false,
        compress: {
          screw_ie8: true,
          warnings: false,
          conditionals: true,
          unused: true,
          comparisons: true,
          sequences: true,
          dead_code: true,
          evaluate: true,
          if_return: true,
          join_vars: true,
          negate_iife: false // we need this for lazy v8
        },
      }),

      /**
       * Plugin: NormalModuleReplacementPlugin
       * Description: Replace resources that matches resourceRegExp with newResource
       *
       * See: http://webpack.github.io/docs/list-of-plugins.html#normalmodulereplacementplugin
       */

      new NormalModuleReplacementPlugin(
        /angular2-hmr/,
        helpers.root('config/empty.js')
      ),

      new NormalModuleReplacementPlugin(
        /zone\.js(\\|\/)dist(\\|\/)long-stack-trace-zone/,
        helpers.root('config/empty.js')
      ),


      // AoT
      // new NormalModuleReplacementPlugin(
      //   /@angular(\\|\/)upgrade/,
      //   helpers.root('config/empty.js')
      // ),
      // new NormalModuleReplacementPlugin(
      //   /@angular(\\|\/)compiler/,
      //   helpers.root('config/empty.js')
      // ),
      // new NormalModuleReplacementPlugin(
      //   /@angular(\\|\/)platform-browser-dynamic/,
      //   helpers.root('config/empty.js')
      // ),
      // new NormalModuleReplacementPlugin(
      //   /dom(\\|\/)debug(\\|\/)ng_probe/,
      //   helpers.root('config/empty.js')
      // ),
      // new NormalModuleReplacementPlugin(
      //   /dom(\\|\/)debug(\\|\/)by/,
      //   helpers.root('config/empty.js')
      // ),
      // new NormalModuleReplacementPlugin(
      //   /src(\\|\/)debug(\\|\/)debug_node/,
      //   helpers.root('config/empty.js')
      // ),
      // new NormalModuleReplacementPlugin(
      //   /src(\\|\/)debug(\\|\/)debug_renderer/,
      //   helpers.root('config/empty.js')
      // ),

      /**
       * Plugin: CompressionPlugin
       * Description: Prepares compressed versions of assets to serve
       * them with Content-Encoding
       *
       * See: https://github.com/webpack/compression-webpack-plugin
       */
      //  install compression-webpack-plugin
      new CompressionPlugin({
        regExp: /\.css$|\.html$|\.js$|\.map$/,
        threshold: 2 * 1024
      }),

      /**
       * Plugin LoaderOptionsPlugin (experimental)
       *
       * See: https://gist.github.com/sokra/27b24881210b56bbaff7
       */
      new LoaderOptionsPlugin({
        minimize: true,
        debug: false,
        options: {

          /**
           * Html loader advanced options
           *
           * See: https://github.com/webpack/html-loader#advanced-options
           */
          // TODO: Need to workaround Angular 2's html syntax => #id [bind] (event) *ngFor
          htmlLoader: {
            minimize: true,
            removeAttributeQuotes: false,
            caseSensitive: true,
            customAttrSurround: [
              [/#/, /(?:)/],
              [/\*/, /(?:)/],
              [/\[?\(?/, /(?:)/]
            ],
            customAttrAssign: [/\)?\]?=/]
          },

        }
      }),
      new CopyWebpackPlugin([
        {
          from: 'src/app/assets',
          to: 'app/assets',
          ignore: [ 'theme/node_modules/**/*', 'theme/src/**/*' ]
        },
      ]),
    ],

    /*
     * Include polyfills or mocks for various node stuff
     * Description: Node configuration
     *
     * See: https://webpack.github.io/docs/configuration.html#node
     */
    node: {
      global: true,
      crypto: 'empty',
      process: false,
      module: false,
      clearImmediate: false,
      setImmediate: false
    }

  });
}
