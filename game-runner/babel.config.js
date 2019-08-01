module.exports = {
  presets: [
    [
      '@babel/preset-env', {
        targets: {
          node: 'current',
        },
      },
    ],
  ],
  include: [
    'src',
    'node_modules/@kf',
  ],
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
  ],
};
