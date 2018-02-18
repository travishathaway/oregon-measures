var webpack = require('webpack');
module.exports = {
  entry: [
    "./client/index.js"
  ],
  output: {
    path: __dirname + '/oregon_measures/static',
    filename: "bundle.js"
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react']
        },
        exclude: /node_modules/
      },
      {test: /\.css$/, loader: 'style-loader!css-loader'}
    ]
  },
  plugins: [
  ],
  node: {
    child_process: 'empty',
    fs: "empty"
  }
};
