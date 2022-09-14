#!/usr/bin/env bash

cp package.json dist/

cat > dist/es5/package.json << EOF
{
  "main": "src/index.js",
  "module": "src/index.js",
  "types": "src/index.d.ts",
  "dependencies": {
    "react-native-quick-base64": "^2.0.5",
    "react-native-quick-crypto": "^0.4.6",
    "stream-browserify": "^3.0.0"
  },
  "react-native": {
    "crypto": "react-native-quick-crypto",
    "buffer": "@craftzdog/react-native-buffer",
    "stream": "stream-browserify"
  }
}
EOF

cat > dist/es6/package.json << EOF
{
  "main": "src/index.js",
  "module": "src/index.js",
  "types": "src/index.d.ts",
  "type": "module",
  "dependencies": {
    "react-native-quick-base64": "^2.0.5",
    "react-native-quick-crypto": "^0.4.6",
    "stream-browserify": "^3.0.0"
  },
  "react-native": {
    "crypto": "react-native-quick-crypto",
    "buffer": "@craftzdog/react-native-buffer",
    "stream": "stream-browserify"
  }
}
EOF
