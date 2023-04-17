const path = require('path');
const replaceLib = require('@ant-design/tools/lib/replaceLib');
const getWebpackConfig = require('@ant-design/tools/lib/getWebpackConfig');
const { ESBuildMinifyPlugin } = require('esbuild-loader');
const rucksack = require('rucksack-css');
const autoprefixer = require('autoprefixer');
const tailwindcss = require('tailwindcss');
const { existsSync } = require('fs');
const { version } = require('../package.json');
const themeConfig = require('./themeConfig');
const defaultTailwindConfig = require('./tailwind.config.js');

const { webpack } = getWebpackConfig;

const isDev = process.env.NODE_ENV === 'development';
const { ANT_THEME, DEV_THEME } = process.env;

function alertBabelConfig(rules) {
  rules.forEach(rule => {
    if (rule.loader && rule.loader === 'babel-loader') {
      if (rule.options.plugins.indexOf(replaceLib) === -1) {
        rule.options.plugins.push(replaceLib);
      }
      rule.options.plugins = rule.options.plugins.filter(
        plugin => !plugin.indexOf || plugin.indexOf('babel-plugin-add-module-exports') === -1,
      );
      // Add babel-plugin-add-react-displayname
      rule.options.plugins.push(require.resolve('babel-plugin-add-react-displayname'));
    } else if (rule.use) {
      alertBabelConfig(rule.use);
    }
  });
}

function getTailwindConfig() {
  if (existsSync(path.join(process.cwd(), 'tailwind.config.js'))) {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const appTailwindConfig = require(path.join(process.cwd(), 'tailwind.config.js'));
    return Object.assign(defaultTailwindConfig, appTailwindConfig);
  }
  // eslint-disable-next-line compat/compat
  return defaultTailwindConfig;
}

const port = process.env.DEV_PORT || 8001;

module.exports = {
  port,
  hash: true,
  root: isDev ? '/' : '/gm-antd/',
  source: {
    components: './components',
    docs: './docs',
    changelog: [],
    'components/form/v3': ['components/form/v3.zh-CN.md'],
    'docs/resources': ['./docs/resources.zh-CN.md'],
  },
  theme: ANT_THEME ? './site/theme/index-css-only.js' : './site/theme',
  htmlTemplate: './site/theme/static/template.html',
  themeConfig,
  filePathMapper(filePath) {
    if (filePath === '/index.html') {
      return ['/index.html', '/index-cn.html'];
    }
    if (filePath.endsWith('/index.html')) {
      return [filePath, filePath.replace(/\/index\.html$/, '-cn/index.html')];
    }
    if (filePath !== '/404.html' && filePath !== '/index-cn.html') {
      return [filePath, filePath.replace(/\.html$/, '-cn.html')];
    }
    return filePath;
  },
  doraConfig: {
    verbose: true,
  },
  lessConfig: {
    javascriptEnabled: true,
    modifyVars: {
      'root-entry-name': ANT_THEME || DEV_THEME || 'variable',
    },
  },
  webpackConfig(config) {
    config.resolve.alias = {
      'antd/lib': path.join(process.cwd(), 'components'),
      'antd/es': path.join(process.cwd(), 'components'),
      // Change antd from `index.js` to `site/antd.js` to remove deps of root style
      antd: path.join(process.cwd(), 'site', 'antd'),
      site: path.join(process.cwd(), 'site'),
      'react-router': 'react-router/umd/ReactRouter',
    };

    config.externals = {
      'react-router-dom': 'ReactRouterDOM',
    };

    if (isDev) {
      config.devtool = 'source-map';

      // Resolve use react hook fail when yarn link or npm link
      // https://github.com/webpack/webpack/issues/8607#issuecomment-453068938
      config.resolve.alias = {
        ...config.resolve.alias,
        'react/jsx-runtime': require.resolve('react/jsx-runtime'),
        react: require.resolve('react'),
      };
    } else if (process.env.ESBUILD) {
      // use esbuild
      config.optimization.minimize = true;
      config.optimization.minimizer = [
        new ESBuildMinifyPlugin({
          target: 'es2015',
          css: true,
        }),
      ];
    }

    alertBabelConfig(config.module.rules);

    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });

    config.plugins.push(
      new webpack.DefinePlugin({
        antdReproduceVersion: JSON.stringify(version),
        /** Gm-common 需要 */
        __PRODUCTION__: JSON.stringify(!isDev),
        __NAME__: JSON.stringify('antd'),
      }),
    );

    delete config.module.noParse;

    // Use dev mod to speed up site preview build
    // This is used for CI preview build in `preview-build.yml`
    if (process.env.SITE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('Site build with development mode...');
      config.mode = 'development';
    }

    if (ANT_THEME) {
      config.mode = 'development';
      config.plugins.forEach(plugin => {
        if (plugin?.options?.filename?.includes?.('.css')) {
          delete plugin.options.chunkFilename;
          plugin.options.filename = `${ANT_THEME}.css`;
        }
      });

      // Remove preset target
      config.module.rules.forEach(rule => {
        if (rule.options?.presets?.[1]?.[0]?.includes('preset-env')) {
          delete rule.options.presets[1][1];
          delete rule.options.plugins;
        }
      });

      config.optimization.minimize = false;
      delete config.optimization.minimizer;

      config.externals = [
        /^rc-.*/,
        /^react.*/,
        /^@ant-design\/.*/,
        /^@babel\/.*/,
        /^@algolia\/.*/,
        /^@docsearch\/.*/,
        /autocomplete.js/,
        /docsearch.js/,
        /.*\.md/,
        /lodash/,
        /jquery/,
        /moment/,
        /core-js/,
        /jsonml/,
        /ramda/,
        /tinycolor/,
        /bisheng-plugin/,
      ];
    }

    // Split chunks
    if (config.mode === 'production') {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          vendors: {
            test: /[/\\]node_modules[/\\]@ant-design[/\\]icon/,
            name: 'anticon',
            chunks: 'initial',
            maxSize: 1024 * 1024,
          },
          components: {
            test(module) {
              return (
                module.resource &&
                module.resource.includes('ant-design/components') &&
                !module.resource.includes('demo') &&
                !module.resource.endsWith('md')
              );
            },
            name: 'components',
            chunks: 'initial',
          },
        },
      };
    }

    return config;
  },

  devServerConfig: {
    public: `${process.env.DEV_HOST || 'localhost'}:${port}`,
    disableHostCheck: !!process.env.DEV_HOST,
    historyApiFallback: true,
    proxy: {
      context: ['/ceres'],
      target: 'https://q.guanmai.cn/', // 线上环境
      changeOrigin: true,
    },
  },

  htmlTemplateExtraData: {
    isDev,
  },

  postcssConfig: {
    plugins: [
      rucksack(),
      autoprefixer({
        browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 8', 'iOS >= 8', 'Android >= 4'],
      }),
      tailwindcss(),
    ],
  },
};
