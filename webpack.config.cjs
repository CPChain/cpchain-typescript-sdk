const path = require('path')

const webConfig = {
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

const nodeConfig = {
  target: 'node',
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
            configFile: 'tsconfig.prod.json'
          }
        },
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    mainFields: ['main', 'module']
  },
  output: {
    filename: 'bundle.node.min.js',
    path: path.resolve(__dirname, 'dist-node'),
    library: 'CPChain'
  },
  externals: {
    'utf-8-validate': 'utf-8-validate',
    encoding: 'encoding',
    bufferutil: 'bufferutil'
  }
}

module.exports = [webConfig, nodeConfig]
