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
    'node_modules/kf-utils',
    'node_modules/kf-game-engine',
  ],
  // transformIgnorePatterns: [
  //   // Change MODULE_NAME_HERE to your module that isn't being compiled
  //   '/node_modules/(?!MODULE_NAME_HERE).+\\.js$'
  // ],
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
  ],
};
