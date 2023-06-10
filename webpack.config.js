const path = require('path');

module.exports = {
  entry: './src/content/wordCounter.ts',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node-modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'wordCounter.js',
    path: path.resolve(__dirname, 'dist/content'),
  },
};
