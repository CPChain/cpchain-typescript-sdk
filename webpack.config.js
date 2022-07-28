// const webpack = require('webpack')
const path = require('path')
// const CopyPlugin = require('copy-webpack-plugin')
const srcDir = path.join(__dirname, '.', 'src')

module.exports = {
  mode: 'production',
  entry: path.join(srcDir, 'index.ts'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'index.js'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  }
}
