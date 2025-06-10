const path = require('path');

module.exports = {
  // Override the public directory path
  publicPath: '.',
  // Customize webpack configuration
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  },
  // Override the HtmlWebpackPlugin options
  chainWebpack: (config) => {
    config.plugin('html').tap((args) => {
      args[0].template = path.resolve(__dirname, 'index.html');
      return args;
    });
  },
}; 