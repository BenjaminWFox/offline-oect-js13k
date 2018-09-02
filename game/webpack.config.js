const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: {
    ga: './src/ga.js',
    dijkstra: './src/dijkstra.js',
    main: './src/main.js',
    movement: './src/movement.js',
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/dist'
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          warnings: false,
          compress: {
            drop_console: true,
            keep_infinity: true,
          },
          output: {
            comments: false,
            beautify: false,
          },
        }
      })
    ]
  }
};