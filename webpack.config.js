const path = require('path');
const exec = require('child_process').exec;
require('babel-polyfill');


module.exports = {
  mode: 'development',
  entry: ['babel-polyfill', './src/index.js'],
  // module: {
  //   rules: [
  //     {
  //       test: /\.js$/,
  //       include: path.resolve(__dirname, 'src'),
  //       loader: 'babel-loader',
  //     },
  //   ],
  // },
  target: 'node',
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    symlinks: true,
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'main.js',
  },
  plugins: [
    {
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
          exec('node build/main.js', (err, stdout, stderr) => {
            if (stdout) process.stdout.write(stdout);
            if (stderr) process.stderr.write(stderr);
          });
        });
      },
    },
  ],
  watchOptions: {
    ignored: ['build', 'node_modules'],
  },
};
