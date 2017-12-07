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
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const NamedModulesPlugin = require('webpack/lib/NamedModulesPlugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const WebpackShellPlugin = require('webpack-shell-plugin');

/**
 * Webpack Constants
 */
const envFileObj = dotenv.parse(fs.readFileSync(envPath));
const ENV = process.env.ENV = process.env.NODE_ENV = 'development';
const HOST = process.env.HOST || envFileObj.HOST_ADDRESS || '192.168.33.10';
const PORT = process.env.PORT || 3000;
const HMR = helpers.hasProcessFlag('hot');
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
const METADATA = webpackMerge(commonConfig({env: ENV}).metadata, {
  host: HOST,
  port: PORT,
  ENV: ENV,
  HMR: HMR,
  APICONFIG: APICONFIG
});

/**
 * Webpack configuration
 *
 * See: http://webpack.github.io/docs/configuration.html#cli
 */
module.exports = function (options) {
  return webpackMerge(commonConfig({env: ENV}), {

    /**
     * Developer tool to enhance debugging
     *
     * See: http://webpack.github.io/docs/configuration.html#devtool
     * See: https://github.com/webpack/docs/wiki/build-performance#sourcemaps
     */
    devtool: 'inline-source-map',

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
      filename: '[name].bundle.js',

      /**
       * The filename of the SourceMaps for the JavaScript files.
       * They are inside the output.path directory.
       *
       * See: http://webpack.github.io/docs/configuration.html#output-sourcemapfilename
       */
      sourceMapFilename: '[name].map',

      /** The filename of non-entry chunks as relative path
       * inside the output.path directory.
       *
       * See: http://webpack.github.io/docs/configuration.html#output-chunkfilename
       */
      chunkFilename: '[id].chunk.js',

      library: 'ac_[name]',
      libraryTarget: 'var',
    },


    module: {

      rules: [
       {
         test: /\.ts$/,
         use: [
           {
             loader: 'tslint-loader',
             options: {
               configFile: 'tslint.json'
             }
           }
         ],
         exclude: [/\.(spec|e2e)\.ts$/]
       },

        /*
         * css loader support for *.css files (styles directory only)
         * Loads external css styles into the DOM, supports HMR
         *
         */
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
          include: [helpers.root('src', 'styles')]
        },

        /*
         * sass loader support for *.scss files (styles directory only)
         * Loads external sass styles into the DOM, supports HMR
         *
         */
        {
          test: /\.scss$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
          include: [helpers.root('src', 'styles')]
        },
      ]
    },

    plugins: [

      /**
       * Plugin: DefinePlugin
       * Description: Define free variables.
       * Useful for having development builds with debug logging or adding global constants.
       *
       * Environment helpers
       *
       * See: https://webpack.github.io/docs/list-of-plugins.html#defineplugin
       */
      // NOTE: when adding more properties, make sure you include them in custom-typings.d.ts
      new DefinePlugin({
        'ENV': JSON.stringify(METADATA.ENV),
        'NODE_ENV': JSON.stringify(METADATA.ENV),
        'HMR': METADATA.HMR,
        'process.env': {
          'ENV': JSON.stringify(METADATA.ENV),
          'NODE_ENV': JSON.stringify(METADATA.ENV),
          'HMR': METADATA.HMR,
          'APICONFIG': JSON.stringify(METADATA.APICONFIG),
        }
      }),
      /**
       * Webpack shell plugin to execute and build less files before start app.
       */
      new WebpackShellPlugin({
        inject: false,
        safe: true,
        onBuildStart: ['cd src/app/assets/theme/; gulp dist-css;'], //execute gulp task to compile less files and generate up-to-date css files
        // create directories "app, assets & theme", then copy theme/assets to /dist/app/assets, and finally move index-styles.css to /dist
        onBuildEnd: ['mkdir dist/app; mkdir dist/app/assets; mkdir dist/app/assets/theme; cp -R src/app/assets/theme/assets dist/app/assets/theme/assets; cp src/index-styles.css dist/;']
      }),

      /**
       * Plugin: NamedModulesPlugin (experimental)
       * Description: Uses file names as module name.
       *
       * See: https://github.com/webpack/webpack/commit/a04ffb928365b19feb75087c63f13cadfc08e1eb
       */
      // new NamedModulesPlugin(),

      /**
       * Plugin LoaderOptionsPlugin (experimental)
       *
       * See: https://gist.github.com/sokra/27b24881210b56bbaff7
       */
      new LoaderOptionsPlugin({
        debug: true,
        options: {
        }
      }),
    ],

    /**
     * Webpack Development Server configuration
     * Description: The webpack-dev-server is a little node.js Express server.
     * The server emits information about the compilation state to the client,
     * which reacts to those events.
     *
     * See: https://webpack.github.io/docs/webpack-dev-server.html
     */
    devServer: {
      port: METADATA.port,
      host: METADATA.host,
      historyApiFallback: true,
      watchOptions: {
        // if you're using Docker you may need this
        // aggregateTimeout: 300,
        // poll: 1000,
        ignored: /node_modules/
      },
      proxy: {
        "/api": "http://127.0.0.1:8000",
        "/o": "http://127.0.0.1:8000"
      }
    },

    /*
     * Include polyfills or mocks for various node stuff
     * Description: Node configuration
     *
     * See: https://webpack.github.io/docs/configuration.html#node
     */
    node: {
      global: true,
      crypto: 'empty',
      process: true,
      module: false,
      clearImmediate: false,
      setImmediate: false
    }

  });
};
