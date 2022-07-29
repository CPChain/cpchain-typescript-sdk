#!/usr/bin/env bash

cp package.json dist/

cat > dist/es5/package.json << EOF
{
  "main": "src/index.js",
  "module": "src/index.js",
  "types": "src/index.d.ts"
}
EOF

cat > dist/es6/package.json << EOF
{
  "main": "src/index.js",
  "module": "src/index.js",
  "types": "src/index.d.ts",
  "type": "module"
}
EOF

