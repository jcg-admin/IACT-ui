const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {
  const isDev = argv.mode === 'development';
  const analyze = process.env.ANALYZE === 'true';

  return {
    mode: argv.mode || 'production',
    entry: './src/index.js',

    cache: {
      type: 'filesystem',
      cacheDirectory: path.resolve(__dirname, '.webpack_cache'),
      buildDependencies: {
        config: [__filename]
      }
    },

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isDev ? '[name].js' : '[name].[contenthash].js',
      chunkFilename: isDev ? '[name].chunk.js' : '[name].[contenthash].chunk.js',
      publicPath: '/',
      clean: true,
    },

    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@redux': path.resolve(__dirname, 'src/redux'),
        '@services': path.resolve(__dirname, 'src/services'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@mocks': path.resolve(__dirname, 'src/mocks'),
        '@types': path.resolve(__dirname, 'src/types'),
        '@styles': path.resolve(__dirname, 'src/styles'),
        '@constants': path.resolve(__dirname, 'src/constants'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@router': path.resolve(__dirname, 'src/router'),
        '@config': path.resolve(__dirname, 'src/config'),
        '@layouts': path.resolve(__dirname, 'src/layouts'),
        '@decorators': path.resolve(__dirname, 'src/decorators'),
      },
    },

    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: { cacheDirectory: true },
          },
        },
        {
          test: /\.(css|scss)$/i,
          use: [
            isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader',
            'sass-loader',
          ],
        },
        {
          test: /\.(png|jpg|jpeg|gif|webp)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 8 * 1024,
            },
          },
          generator: {
            filename: 'images/[name].[hash:8][ext]',
          },
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[hash:8][ext]',
          },
        },
        {
          test: /\.svg$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 4 * 1024,
            },
          },
        },
      ],
    },

    optimization: {
      minimize: !isDev,
      minimizer: !isDev ? [
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ['console.log', 'console.info']
            },
            format: {
              comments: false
            }
          },
          extractComments: false
        })
      ] : [],
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          // React libraries
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-router)[\\/]/,
            name: 'react-vendors',
            priority: 11,
            reuseExistingChunk: true,
          },
          // Redux libraries
          redux: {
            test: /[\\/]node_modules[\\/](redux|react-redux)[\\/]/,
            name: 'redux-vendors',
            priority: 12,
            reuseExistingChunk: true,
          },
          // Charts libraries
          charts: {
            test: /[\\/]node_modules[\\/](recharts|d3)[\\/]/,
            name: 'charts-vendors',
            priority: 13,
            reuseExistingChunk: true,
          },
          // Other vendors
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            reuseExistingChunk: true,
          },
          // Common modules used in 2+ chunks
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
            name: 'common',
          },
        },
        minSize: 20000,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
      },
      runtimeChunk: {
        name: 'runtime',
      },
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        minify: !isDev && {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
        },
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(argv.mode || 'production'),
        'process.env.API_URL': JSON.stringify(process.env.API_URL || 'http://localhost:5000'),
        'process.env.WS_URL': JSON.stringify(process.env.WS_URL || 'ws://localhost:8080'),
        'process.env.APP_VERSION': JSON.stringify(require('./package.json').version),
      }),
      !isDev && new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css',
      }),
      analyze && new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: path.resolve(__dirname, 'dist/bundle-report.html'),
        openAnalyzer: false,
        generateStatsFile: true,
        statsFilename: path.resolve(__dirname, 'dist/bundle-stats.json'),
      }),
    ].filter(Boolean),

    devServer: {
      port: 3000,
      hot: true,
      historyApiFallback: true,
      compress: true,
      headers: {
        'Cache-Control': 'max-age=31536000, immutable'
      },
      
      open: false,
      
      client: {
        overlay: {
          errors: true,
          warnings: false,
        },
        logging: 'info',
        progress: true,
      },
      
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          pathRewrite: { '^/api': '' },
          changeOrigin: true,
          secure: false,
        },
        '/ws': {
          target: 'ws://localhost:8080',
          ws: true,
          changeOrigin: true,
        },
      },
    },

    devtool: isDev ? 'cheap-module-source-map' : 'source-map',

    performance: {
      hints: isDev ? false : 'warning',
      maxEntrypointSize: 300000,
      maxAssetSize: 250000,
      assetFilter: function(assetFilename) {
        return !assetFilename.endsWith('.map') && 
               !assetFilename.endsWith('.LICENSE.txt');
      },
    },
  };
};
