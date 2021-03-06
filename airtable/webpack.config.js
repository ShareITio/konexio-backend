const path = require("path");
const glob = require("glob");
const webpack = require("webpack");
const Dotenv = require("dotenv-webpack");

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

const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "production",
  entry: glob
    .sync("./src/scripts/*.js")
    .reduce(
      (acc, cur) => ({ ...acc, [/\/([0-9a-zA-z]+?).js/.exec(cur)[1]]: cur }),
      {}
    ),
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name].bundle.js",
    iife: false,
  },
  plugins: [new webpack.ProgressPlugin(), new Dotenv()],
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 6,
          compress: true,
          output: {
            comments: false,
            beautify: false,
          },
        },
      }),
    ],
    minimize: false,
  },
  experiments: { topLevelAwait: true },
  // module: {
  //   rules: [
  //     {
  //       test: /\.(js|mjs|jsx|ts|tsx)$/,
  //       exclude: /node_modules/,
  //       use: {
  //         loader: "babel-loader",
  //         options: {
  //           plugins: ["@babel/plugin-syntax-top-level-await"],
  //         },
  //       },
  //     },
  //   ],
  // },
};
