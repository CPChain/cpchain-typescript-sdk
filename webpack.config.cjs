const path = require('path')

module.exports = {
  target: 'web',
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        resolve: {
          fullySpecified: false,
          mainFields: ['main']
        },
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.prod.json'
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
    filename: 'bundle.min.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'CPChain' // use CPChain.default to access the default export in browser
  }
}
