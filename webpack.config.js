// 引入路径模块
const path = require('path')

module.exports = {
  entry: './src/index.ts',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        resolve: {
          fullySpecified: false
        },
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.json'
          }
        },
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: 'cpchain-typescript-sdk.min.js',
    path: path.resolve(__dirname, 'dist'),
    library: '_cpchain'
  },
  externals: {
    'utf-8-validate': 'utf-8-validate',
    encoding: 'encoding',
    bufferutil: 'bufferutil'
  }
}
