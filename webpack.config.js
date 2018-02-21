var webpack = require('webpack');
module.exports = {
  entry: [
    "./client/index_2.js"
  ],
  output: {
    path: __dirname + '/oregon_measures/static',
    filename: "bundle.js",
    sourceMapFilename: "bundle.js.map",
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.js?$/,
        loader: 'babel',
        exclude: /node_modules/
      },
      {
        test: /\.css$/, 
        loader: 'style-loader!css-loader'
      }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    "alias": {
      "react": "preact-compat",
      "react-dom": "preact-compat"
    }
  },
  plugins: [
  ],
  node: {
    child_process: 'empty',
    fs: "empty"
  }
};
