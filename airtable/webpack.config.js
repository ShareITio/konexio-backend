const path = require("path");
// const webpack = require("webpack");
const Dotenv = require("dotenv-webpack");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");

/*
 * SplitChunksPlugin is enabled by default and replaced
 * deprecated CommonsChunkPlugin. It automatically identifies modules which
 * should be splitted of chunk by heuristics using module duplication count and
 * module category (i. e. node_modules). And splits the chunks…
 *
 * It is safe to remove "splitChunks" from the generated configuration
 * and was added as an educational example.
 *
 * https://webpack.js.org/plugins/split-chunks-plugin/
 *
 */

/*
 * We've enabled TerserPlugin for you! This minifies your app
 * in order to load faster and run less javascript.
 *
 * https://github.com/webpack-contrib/terser-webpack-plugin
 *
 */

// const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  // mode: "development",

  entry: {
    sendAlone: "./src/sendAlone.script.js",
    sendWithTemplate: "./src/sendWithTemplate.script.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js",
  },

  plugins: [
    // new webpack.ProgressPlugin(),
    new Dotenv(),
    new UglifyJSPlugin(),
  ],

  // module: {
  //   rules: [
  //     {
  //       test: /\.(js|jsx)$/,
  //       include: [path.resolve(__dirname, "src")],
  //       loader: "babel-loader",
  //     },
  //   ],
  // },

  optimization: {
    // minimizer: [new TerserPlugin()],
    minimize: false,

    // splitChunks: {
    //   cacheGroups: {
    //     vendors: {
    //       priority: -10,
    //       test: /[\\/]node_modules[\\/]/,
    //     },
    //   },

    //   chunks: "async",
    //   minChunks: 1,
    //   minSize: 30000,
    //   name: false,
    // },
  },
};
