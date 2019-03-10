const path = require('path');

module.exports = {
  'parser': 'babel-eslint',
  'extends': [
    'airbnb'
  ],
  'plugins': [
    'emotion',
    'babel',
    'react',
    'promise',
    'jest'
  ],
  'env': {
    "jest": true,
    'browser' : true
  },
  'globals': {
    'Phaser': true,
    'PIXI': true,
    'p2': true,
  },
  'settings': {
    'import/resolver': {
      'node':{
        'moduleDirectory': [
          path.resolve('src'),
          path.resolve('node_modules'),
          path.resolve('lib'),
        ]
      }
    }
  },
  'rules': {
    'jsx-quotes': [2, 'prefer-double'],
    'max-len': [1, 100, 2],
    'import/no-named-as-default': 0,
    'react/jsx-filename-extension': 0,
    'import/prefer-default-export': 0,
    'no-param-reassign': ['error', { 'props': false }],
    'no-underscore-dangle': 0,
    'import/no-unresolved': [2,{'ignore':[ 'rxjs']}],
    'func-names':0,
    'react/jsx-wrap-multilines': 0,
    // temporary since webpack-resolver not working with aliases in webpack2
    'import/no-extraneous-dependencies':0,
    'react/require-default-props':0,
    'array-callback-return':0,
    'react/destructuring-assignment':0,
    'react/jsx-closing-tag-location':0,
    'react/jsx-closing-tag-location':0,
    'space-before-function-paren':0,
    'implicit-arrow-linebreak':0,
  },
}
