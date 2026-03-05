---
title: "前端工程化与架构"
sidebar_position: 1
---

# Axios的封装（基于XHR）
## Axios配置拦截器
```javascript
// src/utils/axios.js
import axios from 'axios';
import router from '@/router'; // 引入路由实例

// 创建axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // 环境变量配置
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// 本地存储Token键名
const TOKEN_KEY = 'access_token';
const getToken = () => localStorage.getItem(TOKEN_KEY);

// 白名单接口（无需Token）
const WHITE_LIST = ['/login', '/register'];

// 跳转登录页并携带来源路径
const redirectToLogin = () => {
  const redirect = encodeURIComponent(router.currentRoute.fullPath);
  router.replace(`/login?redirect=${redirect}`);
};

// 401未授权处理
const handleUnauthorized = () => {
  localStorage.removeItem(TOKEN_KEY);
  redirectToLogin();
};

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 白名单跳过Token注入
    if (WHITE_LIST.some(path => config.url.includes(path))) {
      return config;
    }

    // 自动添加Token
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // 未登录时中断请求并重定向
      redirectToLogin();
      return Promise.reject('用户未登录');
    }

    return config;
  },
  error => Promise.reject(error)
);

// 响应拦截
service.interceptors.response.use(
  response => {
    // 业务成功直接返回数据
    return response.data;
  },
  error => {
    // 统一处理HTTP错误码
    const { response } = error;
    if (!response) {
      // 网络错误
      console.error('网络连接异常，请检查网络');
      return Promise.reject(error);
    }

    switch (response.status) {
      case 401:
        handleUnauthorized(); // 处理未授权
        break;
      case 403:
        console.error('无权限访问');
        break;
      case 500:
        console.error('服务器内部错误');
        break;
      default:
        console.error(`请求错误: ${response.status}`);
    }
    return Promise.reject(error);
  }
);
```

## 通用封装
```javascript
// 泛型封装Get/Post请求
export function get<T>(url: string, params?: object): Promise<T> {
  return service.get(url, { params });
}

export function post<T>(url: string, data?: object): Promise<T> {
  return service.post(url, data);
}

// 示例：登录接口
export const login = (data: { username: string; password: string }) => 
  post<{ token: string }>('/auth/login', data);
```

## 请求取消
```javascript
const controller = new AbortController();

axios.get('/api/data', {
  signal: controller.signal // 绑定信号
})
.then(response => { /* ... */ })
.catch(error => {
  if (error.name === 'AbortError') {
    console.log('请求已终止');
  }
});

// 终止请求
controller.abort();
```

# 前端工程化错误监控
```typescript
这种监控可以帮助开发人员及时发现和解决问题，提高应用程序的稳定性和可靠性。

1. Sentry：Sentry是一款开源的错误监控平台，可以监控前端、后端以及移动端应用程序中的错误和异常。Sentry提供了实时错误报告、错误分析和错误解决方案等功能。

2. Bugsnag：Bugsnag是一款专门用于监控Web应用程序和移动应用程序的错误监控工具。它可以捕获JavaScript异常、网络请求错误、客户端错误等。

3. Google Analytics：Google Analytics可以监控网站的访问量、页面浏览量、访问时长和用户行为等。它还提供了实时报告和错误报告等功能，可以帮助开发人员发现和解决问题。

4. Performance API：Performance API是一个浏览器提供的API，可以监控Web应用程序的性能。它可以捕获页面加载时间、资源下载时间和JavaScript执行时间等信息。

5. 前端错误监控SDK：很多前端错误监控工具都提供了JavaScript SDK，可以通过在应用程序中引入SDK来捕获错误和异常。开发人员可以根据捕获的错误信息来定位和解决问题。
```

# 前端架构monorepo
### 传统架构到 monorepo 架构演变
```javascript
架构基础：
  代码集中化，多个项目集合到一个项目
  工具引入，pnpm workspace
  CI/CD重构

monorepo 架构实现：
  公共模块抽离
  pnpm、turbo 解决子包与主包关系

优化自动化构建流程：
  打包方案：vite webpack tsup esbuild
  构建流程优化
  发布
  监控和测试
```

# react 项目构建
## 1、脚手架开局（已废弃⚠️）
```javascript
全局安装create-react-app：
$ npm install -g create-react-app

创建一个项目：
$ create-react-app your-app 注意命名方式

Creating a new React app in /dir/your-app.

如果不想全局安装，可以直接使用npx：
$ npx create-react-app your-app	也可以实现相同的效果
```

## 2、webpack开局（推荐使用 vite⚠️）
#### 初始化项目空间
```javascript
新建一个项目目录，在目录下执行：npm init -y
此时将会生成 package.json 文件
之后新建 src、config（配置webpack）文件夹，新建index.html文件
```

#### 安装webpack和react相关依赖文件
```bash
npm i webpack webpack-cli webpack-dev-server html-webpack-plugin babel-loader path -D
npm i react react-dom
```

#### 在src目录配置index.js文件
```javascript
import React from 'react';
import ReactDOM from 'react-dom';

ReactDOM.render(
  <React.StrictMode>
  <div>你好，React-webpack5-template</div>
  </React.StrictMode>,
document.getElementById('root')
);
```

#### 在src目录配置index.html文件
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>react-app</title>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
```

#### 配置根目录webpack配置文件
##### 新建webpack.common.js文件，部分代码仅供参考
```javascript
const webpack = require('webpack');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackObfuscator = require('webpack-obfuscator');
const pages = ['index' /*, "message", */]; // 多页面频道配置
const envConfig = require('./config/env');
const isProduction =
  process.env.APP_ENV === 'production' ||
  process.env.APP_ENV === 'preProduction';
const isDevelopment = process.env.APP_ENV === 'development';

function recursiveIssuer(m) {
  if (m.issuer) {
    return recursiveIssuer(m.issuer);
  } else if (m.name) {
    return m.name;
  } else {
    return false;
  }
}

// 获取CSS输出
function getCssOutput() {
  let pathStyle = {};
  pages.map((item) => {
    pathStyle[`${item}Styles`] = {
      name: item,
      test: (m, c, entry = item) =>
        m.constructor.name === 'CssModule' && recursiveIssuer(m) === entry,
      chunks: 'all',
      enforce: true,
    };
  });

  return pathStyle;
}

/**
 * 【获取entry文件入口】
 * @returns {Object} 返回的entry { "static":"./src/static/index.js",}
 */
function getEntry() {
  let entryConfig = {};

  pages.map((item) => {
    entryConfig[item] = `./src/${item}.js`;
  });

  return entryConfig;
}

// 获取多个页面html生成配置
function getHtmlPlugin() {
  let plugins = [];

  pages.map((item) => {
    plugins.push(
      new HtmlWebpackPlugin({
        publicPath: envConfig.STATIC_DOMAIN, // 静态资源引入domain
        template: `./src/${item}${isProduction ? '_prod' : ''}.html`,
        filename: `${item}.html`,
        hash: false,
        chunks: [item],
        // favicon: './favicon.ico',
        inject: true,
        minify: {
          collapseWhitespace: true, //把生成文件的内容的没用空格去掉，减少空间
        },
      })
    );
  });

  return plugins;
}

module.exports = {
  entry: getEntry(), // 获取entry文件入口
  optimization: {
    moduleIds: 'deterministic',
    chunkIds: 'deterministic',
    splitChunks: {
      cacheGroups: getCssOutput(), // CSS输出配置
    },
  },
  output: {
    filename: 'static/js/[name].bundle.[fullhash].js',
    chunkFilename: 'static/js/[name].bundle.[chunkhash].js',
    path: path.resolve(__dirname, 'dist/'),
    publicPath: envConfig.PUBLIC_PATH,
  },
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@/store': path.join(__dirname, 'src/store'),
      '@/actions': path.join(__dirname, 'src/actions'),
      '@/reducers': path.join(__dirname, 'src/reducers'),
      '@/components': path.join(__dirname, 'src/components'),
      '@/containers': path.join(__dirname, 'src/containers'),
      '@/assets': path.join(__dirname, 'src/assets'),
      '@/utils': path.join(__dirname, 'src/utils'),
      '@/socket': path.join(__dirname, 'src/socket'),
      '@/reactX': path.join(__dirname, 'src/reactX'),
      '@/pages': path.join(__dirname, 'src/pages'),
      '@/img': path.join(__dirname, 'src/assets/img'),
      '@/hooks': path.join(__dirname, 'src/hooks'),
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(le|c)ss$/, // .less and .css
        use: [
          isDevelopment
            ? 'style-loader'
            : {
              loader: MiniCssExtractPlugin.loader,
              options: {
                publicPath: '../',
              },
            },
          {
            loader: 'css-loader',
            options: {
              // url: false,
              sourceMap: isDevelopment,
            },
          },
          'less-loader',
        ],
      },
      {
        test: /\.(html|htm)$/i,
        use: 'html-withimg-loader', // 解析 html中的图片资源
      },
      {
        //图片小于一定大小使用base64 否则使用file-loader产生真实图片
        test: /\.(png|gif|jp?g|svg|webp|ico)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 5000, //小于限定使用base64
              name: 'static/images/[name].[hash:8].[ext]',
              publicPath: `../../`,
              esModule: false,
            },
          },
        ],
      },
      {
        test: /\.(eot|woff|woff2|ttf|OTF|otf)(\?.*)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'static/fonts/[name].[hash:8].[ext]',
              publicPath: `../../`,
              esModule: false,
            },
          },
        ],
      },
      {
        test: /\.(ogg|mp3|mp4|wav|mpe?g)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              publicPath: `../../`,
              name: 'static/medias/[name].[hash:8].[ext]',
              esModule: false,
            },
          },
        ],
      },
      {
        test: /\.jsx?$/,
        include: [path.resolve(__dirname, 'src/pages/allCase/index.js')],
        enforce: 'post',
        use: {
          loader: WebpackObfuscator.loader,
          options: { rotateStringArray: true },
        },
      },
    ],
  },
  plugins: [
    ...[
      new webpack.DefinePlugin({
        envConfig: JSON.stringify(envConfig),
      }),
      new webpack.HotModuleReplacementPlugin(),
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: !isDevelopment
          ? ['**/*', '!global*', '!client/js/global*', '!client/js/global/**']
          : [],
      }), // 清理非global目录文件
    ],
    ...getHtmlPlugin(),
  ],
  stats: { warnings: false, children: false },
};

```

##### 新建webpack.base.conf.js文件，部分代码仅供参考
```javascript
"use strict";
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  // 入口起点
  entry: {
    app: "./src/index.js",
  },
  // 输出
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "[name].js",
  },
  // 解析
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
    alias: {
      "@components": path.join(__dirname, "../src/components"),
      "@utils": path.join(__dirname, "../src/utils"),
      "@pages": path.join(__dirname, "../src/pages"),
    },
  },
  // loader
  module: {
    rules: [
      {
        test: /\.js|jsx$/,
        exclude: /(node_modules|bower_components)/, // 屏蔽不需要处理的文件（文件夹）（可选）
        loader: "babel-loader",
      },
      {
        //支持less
        // npm install style-loader css-loader less-loader less --save-dev
        test: /\.(le|c)ss$/, // .less and .css
        use: ["style-loader", "css-loader", "less-loader"], // 创建的css文件存在html的头部
      },
    ],
  },
  // 插件
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "src/index.html",
      inject: "body",
      hash: false,
      minify: {
        collapseWhitespace: true, //把生成文件的内容的没用空格去掉，减少空间
      },
    }),
  ],
};
```

##### 新建webpack.development.js文件，部分代码仅供参考
```javascript
"use strict";
const { merge } = require("webpack-merge");
const baseWebpackConfig = require("./webpack.base.conf");
const path = require("path");
const webpack = require("webpack");

module.exports = merge(baseWebpackConfig, {
  // 模式
  mode: "development",
  // 调试工具
  devtool: "inline-source-map",
  // 开发服务器
  devServer: {
    static: path.resolve(__dirname, "static"),
    historyApiFallback: true, // 在开发单页应用时非常有用，它依赖于HTML5 history API，如果设置为true，所有的跳转将指向index.html
    compress: true, // 启用gzip压缩
    hot: true, // 模块热更新，取决于HotModuleReplacementPlugin
    host: "127.0.0.1", // 设置默认监听域名，如果省略，默认为“localhost”
    port: 8888, // 设置默认监听端口，如果省略，默认为“8080”
  },
  optimization: {
    nodeEnv: "development",
  },
});
```

##### 新建webpack.prod.conf.js文件
```javascript
"use strict";
const { merge } = require("webpack-merge");
const baseWebpackConfig = require("./webpack.base.conf");

const path = require("path");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = merge(baseWebpackConfig, {
  // 模式
  mode: "production",
  // 调试工具
  devtool: "source-map",
  // 输出
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "js/[name].[chunkhash].js",
  },
  // 插件
  plugins: [new CleanWebpackPlugin()],
  // 代码分离相关
  optimization: {
    nodeEnv: "production",
    runtimeChunk: {
      name: "manifest",
    },
    splitChunks: {
      minSize: 30000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      name: false,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          chunks: "initial",
        },
      },
    },
  },
});
```

#### 新建.babelrc文件
```javascript
{
  "presets": ["latest", "react", "stage-2"],
  "plugins": []
}
```

#### 修改package.json中的script代码
```javascript
  "scripts": {
    "dev": "webpack-dev-server --hot  --config config/webpack.dev.conf.js",
    "start": "npm run dev",
    "build": "webpack --progress --colors --config config/webpack.prod.conf.js"
  },
```

#### 此时，package.json中部分代码如下
```javascript
{
  "name": "webpack-react-demo",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "dev": "webpack-dev-server --hot  --config config/webpack.dev.conf.js",
    "start": "npm run dev",
    "build": "webpack --progress  --config config/webpack.prod.conf.js"
  },
  "license": "ISC",
  "devDependencies": {
    "babel-core": "^6.26.3",
    "babel-loader": "^7.1.5",
    "babel-plugin-import": "^1.13.5",
    "babel-preset-latest": "^6.24.1",
    "babel-preset-react": "^6.24.1",
    "babel-preset-stage-0": "^6.24.1",
    "clean-webpack-plugin": "^4.0.0",
    "css-loader": "^6.7.1",
    "file-loader": "^6.2.0",
    "html-webpack-plugin": "^5.5.0",
    "less-loader": "^11.0.0",
    "node-less": "^1.0.0",
    "style-loader": "^3.3.1",
    "url-loader": "^4.1.1",
    "webpack": "^5.74.0",
    "webpack-cli": "^4.10.0",
    "webpack-dev-server": "^4.10.1",
    "webpack-merge": "^5.8.0"
  },
  "dependencies": {
    "less": "^4.1.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^5.1.2"
  }
}
```

#### 在项目中添加代码规范检测
```bash
yarn add babel-eslint --save-dev
yarn add @umijs/fabric -D   //@umijs/fabric一个包含 prettier，eslint，stylelint 的配置文件合集。
yarn add prettier --save-dev  //默认@umijs/fabric已经给我们安装了需要的依赖，但是默认是没有pretter。

结合项目中安装eslint-plugin-react-hooks并在.eslintrc.js中配置
  rules:{
    "react-hooks/rules-of-hooks":'error',
    "react-hooks/exhaustive-deps":'warn',
  } 
可以一键生成hooks依赖
```

#### 新增如下文件（用于规范项目组代码）
##### .eslintrc.js文件
```javascript
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [require.resolve("@umijs/fabric/dist/eslint")],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  parser: "babel-eslint",
  globals: {
    gtag: true,
    $: true,
    _g_deflang: true,
    require: true,
    envConfig: true,
    process: true,
    React: true,
    ysf: true,
    initNECaptcha: true,
    initNECaptchaWithFallback: true,
  },
  // plugins: ["react"],
  rules: {
    //"react/jsx-uses-react": 2,
    "no-nested-ternary": 0, // 允许嵌套三元表达式
    "no-script-url": 0, // 允许javascript:;
    "prefer-destructuring": 0, // 关闭强制使用解构
    "no-plusplus": 0, // 允许使用++和--的操作
    "array-callback-return": 0, // 允许数组map不返回值
    "consistent-return": 0,
    "no-param-reassign": 0, // 允许修改函数形参
    "no-unused-expressions": 0,
    "no-restricted-syntax": 0,
    "react/prop-types": 0,
    "no-prototype-builtins": 0,
    "react/no-deprecated": 0, // 关闭react弃用检测
    "react/no-string-refs": 0,
    "no-useless-escape": 0,
    "react-hooks/rules-of-hooks":'error',
    "react-hooks/exhaustive-deps":'warn',
  },
};
```

##### .eslintignore文件
```javascript
/lambda/
/scripts/*
.history
serviceWorker.ts
/config/*
/public/*
*.js
```

##### .prettierrc.js文件
```javascript
module.exports = {
  singleQuote: true,
  jsxSingleQuote: true,
  semi: true,
};
```

##### .prettierignore文件
```javascript
**/*.svg
package.json
.umi
.umi-production
/dist
.dockerignore
.DS_Store
.eslintignore
*.png
*.toml
docker
.editorconfig
Dockerfile*
.gitignore
.prettierignore
LICENSE
.eslintcache
*.lock
yarn-error.log
.history
```

##### .stylelintrc.js文件
```javascript
const fabric = require('@umijs/fabric');
module.exports = {
  ...fabric.stylelint,
};
```

#### 替换package.json中命令
```javascript
  "scripts": {
    "lint": "umi g tmp && npm run lint:js && npm run lint:style && npm run lint:prettier",
    "lint-staged:js": "eslint --ext .js,.jsx,.ts,.tsx ",
    "lint:fix": "eslint --fix --cache --ext .js,.jsx,.ts,.tsx --format=pretty ./src && npm run lint:style",
    "lint:js": "eslint --cache --ext .js,.jsx,.ts,.tsx --format=pretty ./src",
    "lint:prettier": "prettier --check \"src/**/*\" --end-of-line auto",
    "lint:style": "stylelint --fix \"src/**/*.less\" --syntax less",
    "prettier": "prettier -c --write \"src/**/*\"",
    "precommit": "lint-staged",
    "precommit:fix": "npm run lint:fix && npm run prettier && npm run lint:prettier && npm run lint:style",
    "dev": "webpack-dev-server --hot  --config config/webpack.dev.conf.js",
    "start": "npm run dev",
    "build": "webpack --progress  --config config/webpack.prod.conf.js"
  },
```

#### 安装cross-env（运行跨平台设置和使用环境变量的脚本）
```javascript
1、安装：npm install --save-dev cross-env
2、修改启动命令（原命令前加上 cross-env APP_ENV=development 环境变量）：
	 "start:dev": "cross-env APP_ENV=development webpack serve --config webpack.development.js",
 	 "testing": "cross-env APP_ENV=testing webpack --config webpack.testing.js",
   "build": "cross-env APP_ENV=production webpack --config webpack.production.js",
   "preBuild": "cross-env APP_ENV=preProduction webpack --config webpack.production.js",
3、读取环境变量：process.env.APP_ENV
```

#### 添加提交前检测
```bash
#使用husky lint-staged在commit的时候校检你提交的代码是否符合规范
yarn add husky lint-staged -D
```

#### package.json新增如下代码
```javascript
  "lint-staged": {
    "**/*.less": "stylelint--syntaxless",
    "**/*.{js,jsx,ts,tsx}": "npmrunlint-staged:js",
    "**/*.{js,jsx,tsx,ts,less,md,json}": [
      "prettier--write"
    ]
  },
  "husky": {
    "hooks": {
      "pre-commit": "npmrunlint-staged"
    }
  }
```

#### package.json中全部代码如下
```javascript
{
  "name": "reactt-home",
  "version": "1.0.0",
  "description": "reactt-home",
  "main": "index.js",
  "scripts": {
    "lint": "eslint --ext .js --ext .jsx src",
    "start": "cross-env APP_ENV=development webpack serve --config webpack.development.js",
    "testing": "cross-env APP_ENV=testing webpack --config webpack.testing.js",
    "build": "cross-env APP_ENV=production webpack --config webpack.production.js",
    "preBuild": "cross-env APP_ENV=preProduction webpack --config webpack.production.js",
    "lint-staged": "lint-staged",
    "lint-staged:js": "eslint --ext .js,.jsx,.ts,.tsx ",
    "lint:fix": "eslint --fix --quiet --cache --ext .js,.jsx,.ts,.tsx --format=pretty ./src && npm run lint:style",
    "lint:js": "eslint --cache --ext .js,.jsx,.ts,.tsx --format=pretty ./src",
    "lint:prettier": "prettier --check \"**/*\" --end-of-line auto",
    "lint:style": "stylelint --fix \"src/**/*.less\" --syntax less",
    "prettier": "prettier -c --write \"**/*\""
  },
  "author": "shenzhihao",
  "license": "ISC",
  "devDependencies": {
    "@babel/core": "^7.7.4",
    "@babel/plugin-proposal-class-properties": "^7.7.4",
    "@babel/plugin-transform-object-assign": "^7.8.3",
    "@babel/plugin-transform-runtime": "^7.7.4",
    "@babel/polyfill": "^7.7.0",
    "@babel/preset-env": "^7.7.4",
    "@babel/preset-react": "^7.7.4",
    "@babel/runtime": "^7.7.4",
    "@pmmmwh/react-refresh-webpack-plugin": "^0.5.7",
    "babel-eslint": "^10.1.0",
    "babel-loader": "^8.0.6",
    "babel-plugin-import": "^1.13.0",
    "clean-webpack-plugin": "^3.0.0",
    "compression-webpack-plugin": "^6.0.5",
    "copy-webpack-plugin": "^11.0.0",
    "cross-env": "^7.0.3",
    "css-loader": "^3.2.1",
    "css-minimizer-webpack-plugin": "^4.0.0",
    "css-vars-ponyfill": "^2.4.7",
    "eslint": "^7.25.0",
    "eslint-formatter-pretty": "^4.0.0",
    "eslint-plugin-import": "^2.22.1",
    "eslint-plugin-jsx-a11y": "^6.4.1",
    "eslint-plugin-prettier": "^3.4.0",
    "eslint-plugin-react": "^7.23.2",
    "eslint-plugin-react-hooks": "^4.2.0",
    "file-loader": "^5.0.2",
    "files-finder": "0.0.5",
    "html-webpack-plugin": "^5.5.0",
    "html-withimg-loader": "^0.1.16",
    "image-webpack-loader": "^6.0.0",
    "javascript-obfuscator": "^4.0.0",
    "less": "^3.10.3",
    "less-loader": "^7.0.1",
    "lint-staged": "^11.0.0",
    "mini-css-extract-plugin": "^2.6.1",
    "pre-commit": "^1.2.2",
    "prettier": "^2.2.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-redux": "^7.1.3",
    "react-refresh": "^0.14.0",
    "react-router-dom": "^5.1.2",
    "react-router-redux": "^4.0.8",
    "redux": "^4.0.4",
    "redux-actions": "^2.6.5",
    "redux-logger": "^3.0.6",
    "redux-thunk": "^2.3.0",
    "style-loader": "^1.0.1",
    "stylelint": "^13.13.1",
    "stylelint-config-css-modules": "^2.2.0",
    "stylelint-config-prettier": "^8.0.2",
    "stylelint-config-rational-order": "^0.1.2",
    "stylelint-config-standard": "^22.0.0",
    "stylelint-declaration-block-no-ignored-properties": "^2.3.0",
    "stylelint-no-unsupported-browser-features": "^4.1.4",
    "stylelint-order": "^4.1.0",
    "terser-webpack-plugin": "^5.3.3",
    "url-loader": "^3.0.0",
    "webpack": "^5.73.0",
    "webpack-cli": "^4.2.0",
    "webpack-dev-server": "^3.11.0",
    "webpack-merge": "^4.2.2",
    "webpack-obfuscator": "^3.5.1"
  },
  "dependencies": {
    "axios": "^0.19.0",
    "classnames": "^2.2.6",
    "cross-env": "^7.0.3",
    "history": "^4.10.1",
    "paho-mqtt": "^1.1.0"
  },
  "pre-commit": "lint-staged",
  "lint-staged": {
    "**/*.less": "stylelint --syntax less",
    "**/*.{js,jsx,ts,tsx}": "npm run lint-staged:js",
    "**/*.{js,jsx,tsx,ts,less,md,json}": [
      "prettier --write"
    ]
  }
}
```

##### 
# 在JS项目中添加TS
### tsconfig.json配置文件
```javascript
{
  
  "compilerOptions": {
    
    "incremental": true ,//增量编译
    
    "tsBuildInfoFile": ".tsbuildinfo", //增量编译文件的存储位置
    
    "diagnostics": true, //打印诊断信息
    
    "target": "ES5", //目标语言版本
    
    "module": "commonjs",//生成代码的模块标准
    
    "outFile": "./app.js", //将多个相互依赖的文件生成一个文件，可以用在AMD模块中
    
    "lib": [], //TS需要引用的库，即声明文件
    
    "allowJs": true, //允许编辑JS文件（js,jsx）
    
    "outDir": "./out", //指定输出的目录
    
    "rootDir": "./" ,//指定输入文件目录 （用于输出）
    
    "declaration": false, //生成声明文件
    
    "declarationDir": "./d", //声明文件的路径
    
    "emitDeclarationOnly": false ,//只生成声明文件
    
    "sourceMap": false, //生成目标文件的sourecMap
    
    "inlineSourceMap": false,//声明目标文件的inline sourceMap
    
    "declarationMap": false,//生成声明文件的sourceMap
    
    "typeRoots": [], //声明文件目录 默认node_modules/@types
    
    "types": [], //声明文件包
    
    "removeComments": false, //删除注释
    
    "noEmit": false ,//不输出文件
    
    "noEmitOnError": false,//发生错误时不输出文件
    
    "noEmitHelpers": false, //不生成helper函数，需要额外安装 ts-helpers
    
    "importHelpers": false,//通过tslib引入helper函数，文件必须是模块
    
    "downlevelIteration": false,//降级遍历器的实习（es3/es5）
    
    "strict": false, //严格的类型检查
    
    "alwaysStrict": false,//在代码中注入use strict
    
    "strictNullChecks": false, //不允许把null,undefined赋值给其他类型变量
    
    "strictFunctionTypes": false, //不允许函数参数双向协变
    
    "strictPropertyInitialization": false,//类的实例属性必须初始化
    
    "strictBindCallApply": false,//严格的bind/call/apply检查
    
    "noImplicitThis": false,//不允许this有隐式的any类型
    
    "noUnusedLocals": false,//检查只声明，未使用的局部变量
    
    "noUnusedParameters": false,//检查未使用的函数参数
    
    "noFallthroughCasesInSwitch": false,//防止switch语句贯穿
    
    "noImplicitReturns": false,//每个分支都要有返回值
    
    "esModuleInterop": false ,//允许export = 导出, 由import from导入
    
    "allowUmdGlobalAccess": false,//允许在模块中访问UMD全局变量
    
    "moduleResolution": "node", //模块解析策略
    
    "baseUrl": "",//解析非相对模块的基地址
    
    "paths": {} ,//路径映射，相对于baseUrl
    
    "rootDirs": [], //将多个目录放在一个虚拟目录下，用于运行时
    
    "listEmittedFiles": false, //打印输入的文件
    
    "listFiles": false,//打印编译的文件（包括引用的声明文件）
    
  }
}
```

### package.json部分
##### 安装 typescript和ts-loader
```javascript
yarn add typescript --D
```

##### 安装react类型配置
```javascript
yarn add @types/node @types/react @types/react-dom @types/react-router-dom 
```

##### 初始化 tsconfig.json 文件
```html
npx tsc --init
```

##### 配置 tsconfig.json
```javascript
{
  "compilerOptions": {
    	"target": "es2016", /**指定ECMAScript目标版本**/                  
      "module": "commonjs", /**指定生成哪个模块系统代码**/
      "esModuleInterop": true,
      "allowJs": true,  /**允许编译js文件**/                    
      "jsx": "preserve",  /**支持JSX**/                 
      "outDir": "dist",  /**编译输出目录**/   
      "strict": true, /**启用所有严格类型检查选项**/
      "noImplicitAny": false, /**在表达式和声明上有隐含的any类型时报错**/         
      "skipLibCheck": true,  /**忽略所有的声明文件的类型检查**/                  
      "forceConsistentCasingInFileNames": true   /**禁止对同一个文件的不一致的引用**/  
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

##### package.json中scripts新增tsc命令用于检测typescript类型
```javascript
"tsc": "tsc --noEmit"
```

### Webpack部分
##### 安装ts-loader
```javascript
yarn add ts-loader eslint-import-resolver-typescript --D
```

##### reslove:extensions新增.ts和.tsx
```javascript
resolve: {
    extensions: ['.js', '.json', '.ts', '.tsx'],
}
```

##### 配置webpack，新增ts-loader
```javascript
{
    test: /\.tsx?$/, // .ts或者tsx后缀的文件，就是typescript文件
    use: 'babel-loader', 
    exclude: /node-modules/, // 排除node-modules目录
}
```

##### 安装@babel/preset-typescript
```javascript
yarn add @babel/preset-typescript -D
```

##### .babelrc新增typescript配置
```javascript
"presets": [
    ...
    "@babel/typescript"
],
```

### Eslint部分
##### 安装@typescript-eslint/parser和@typescript-eslint/eslint-plugin
```javascript
yarn add @typescript-eslint/parser @typescript-eslint/eslint-plugin -D
```

##### 引入eslint三方配置
```javascript
yarn add eslint-plugin-shopify -D
```

##### .eslintrc.js中新增overrides，检测.ts文件
```javascript
overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      settings: {
        'import/resolver': {
          node: {
            extensions: ['.js', '.jsx', '.ts', '.tsx', '.css'],
          },
          typescript: {
            alwaysTryTypes: true,
          },
        },
      },
      plugins: ['@typescript-eslint'],
      extends: ['plugin:shopify/esnext'],
      parserOptions: {
        // project: './tsconfig.json',
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 12,
        sourceType: 'module',
      },
      rules: {
        'no-console': 0, // 如果有console，阻止抛出错误
        'no-use-before-define': 'off',
      },
    },
  ],
```

##### .eslintignore新增忽略文件tsconfig.json
##### .prettier新增
```javascript
// jsxSingleQuote: true,
extends: [
    'plugin:shopify/typescript',
    'plugin:shopify/react',
    'plugin:shopify/prettier',
  ],

```

##### Tips：
:::danger
eslint不会报告typescript类型错误，ts如需要检测类型需要使用tsc --noEmit命令

:::



# 本地依赖包处理（package.json）
### 本地依赖包版本控制
```javascript
版本号通常由三部分组成：主版本号、次版本号、补丁版本号，格式为 major.minor.patch。常见的符号有：

^：更新时允许自动更新次版本号和补丁版本号，但不会更新主版本号（即不允许跨越大版本升级）。
~：更新时只允许更新补丁版本号，不更新次版本号。
> 或<：指定大于或小于某个版本。
=：指定精确的版本号。
```

### 使用 patch-package 工具修改依赖包
#### 安装 `patch-package`:
##### `npm install --save-dev patch-package 或 yarn add patch-package -D`
#### 修改依赖包源码:
##### 找到需要修改的依赖包文件路径，例如 `node_modules/<dependency-name>/<file-to-patch>`。
##### 对文件进行所需的修改。
#### 创建补丁文件:
##### `npx patch-package <dependency-name>`
#### 这将创建一个 `.patch` 文件在项目的根目录下。
#### 提交补丁文件到版本控制系统: 将生成的 `.patch` 文件提交到你的版本控制系统中。
#### 自动应用补丁
#### 为了确保每次 `npm install` 都能自动应用这些补丁，你需要在 `package.json` 的 `scripts` 字段中添加一条命令：
##### 
`{ 
  "scripts": { 
    "postinstall": "patch-package" 
  } 
}`
#### 这样，在每次执行 `npm install` 后，`patch-package` 将会自动查找 `.patch` 文件并应用它们到相应的 `node_modules` 中。
