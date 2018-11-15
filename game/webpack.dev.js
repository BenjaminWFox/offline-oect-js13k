const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
    watchOptions: {
      poll: true,
      // poll: 1000, // option in ms if true is hard on the filesystem
    },
  },
});
