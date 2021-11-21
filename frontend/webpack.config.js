const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  context: path.resolve(__dirname, 'projects'),
  entry: {
    background: './background/background.ts',
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/../extension',
  },
  target: 'web',
  resolve: {
    plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.scripts.json' })],
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        loader: 'ts-loader',
        options: {
          configFile: 'tsconfig.scripts.json'
        },
      },
    ],
  }
};
