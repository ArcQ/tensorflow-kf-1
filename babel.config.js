module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
  ],
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
  ],
  env: {
    test: {
      plugins: ['dynamic-import-node']
    }
  }
};
