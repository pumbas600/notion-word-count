const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const { prepareBuild, makeDevBuild } = require('./scripts/common');

module.exports = (env) => {
  prepareBuild();
  if (env.distribution) {
    makeDevBuild(env.distribution);
  }

  return {
    plugins: [new MiniCssExtractPlugin()],
    entry: {
      wordCounter: ['./src/content/wordCounter.ts', './src/styles/wordCounter.css'],
    },
    mode: 'production',
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
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
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist/content'),
    },
  };
};
