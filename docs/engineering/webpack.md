---
title: "Webpack 专题"
sidebar_position: 2
---

# webpack5和webpack4之间重要的区别
```javascript
1. 性能改进：webpack5在构建速度和打包体积方面进行了一些优化。它引入了持久缓存，可以减少构建时间。
  	此外，webpack5还引入了更好的树摇（tree shaking）算法，可以更好地优化打包体积。
2. 模块联邦（Module Federation）：这是webpack5中最重要的新功能之一。模块联邦允许不同的应用程序共享模块，从而实现更好的代码复用和拆分。
  	这对于构建大型的微服务架构非常有用。
3. 支持WebAssembly：webpack5对WebAssembly提供了更好的支持。它可以直接导入和导出WebAssembly模块，并且可以通过配置进行优化。
4. 改进的缓存策略：webpack5引入了更好的缓存策略，可以更好地利用浏览器缓存。这可以减少用户在更新应用程序时需要下载的文件数量。
5. 改进的Tree Shaking：webpack5引入了更好的Tree Shaking算法，可以更好地识别和删除未使用的代码。这可以进一步减少打包体积。
6. 改进的持久缓存：webpack5引入了更好的持久缓存策略，可以更好地利用缓存。这可以减少构建时间。
```

# 安装
```bash
npm init -y     // 初始化package.json
npm install webpack webpack-cli --save-dev

npx webpack --watch     // 监听文件修改
npx webpack-dev-server  // 以server的方式启动项目，不会打包物理文件，而是输出到内存
```

# 生命周期
##### 生命周期hooks
```javascript
beforeRun：在webpack开始运行之前调用，可以在此处执行一些准备工作。

run：在webpack开始运行时调用，可以在此处执行一些初始化操作。

beforeCompile：在webpack开始编译之前调用，可以在此处执行一些准备工作。

compile：在webpack开始编译时调用，可以在此处执行一些初始化操作。

make：在webpack开始构建编译器时调用，可以在此处执行一些准备工作。

afterCompile：在webpack完成编译之后调用，可以在此处执行一些后处理操作。

emit：在webpack生成最终的资源之前调用，可以在此处执行一些额外的操作，如生成额外的文件。

afterEmit：在webpack生成最终的资源之后调用，可以在此处执行一些后处理操作。

done：在webpack完成构建之后调用，可以在此处执行一些清理工作。
```

##### 使用hooks
```javascript
module.exports = {
  // ...
  plugins: [
    {
      apply: (compiler) => {
        compiler.hooks.beforeRun.tap('MyPlugin', () => {
          console.log('Before run');
        });

        compiler.hooks.done.tap('MyPlugin', () => {
          console.log('Build done');
        });
      }
    }
  ]
};

//在上述示例中，我们定义了一个自定义插件，并在其中使用了beforeRun和done两个生命周期钩子函数。
//在这些钩子函数中，我们可以执行一些自定义的操作，如输出日志信息。
```

# webpack中的loader（本质是函数）
##### 工作原理
```javascript
webpack loader 在 webpack 构建过程中的生命周期中的工作主要分为以下几个阶段：

解析阶段：webpack 会根据配置文件中的入口文件，递归解析所有的依赖模块。在这个阶段，webpack 会根据文件的后缀名来确定使用哪个 loader 来处理该文件。

编译阶段：在这个阶段，webpack 会将解析后的模块转换成 AST（抽象语法树），并且根据配置文件中的规则，将模块中的代码进行转换和处理。
  			 这个阶段是 loader 的主要工作阶段，loader 可以对模块进行各种处理，例如转换代码、添加额外的功能等。

生成阶段：在这个阶段，webpack 会根据处理后的模块生成最终的输出文件。输出文件的格式和路径可以通过配置文件进行配置。

在这些阶段中，loader 主要在编译阶段发挥作用。loader 可以通过导出一个函数来定义自己的处理逻辑，这个函数接收一个参数，即待处理的模块的源代码，然后返回处理后的代码。
```

##### 多个 loader 通信
```javascript
在Webpack中，loader用于对模块的源代码进行转换，允许你在import或load模块时预处理文件。当多个loader需要对同一个资源进行处理时，它们之间可以通过特定的执行顺序和上下文对象进行通信。

1、Loader链的执行顺序：多个loader可以串联起来，形成一个loader链。这些loader按照在配置中的顺序，从右到左（或从下到上）执行。
  最后一个loader最先执行，它接收的是资源文件的内容；第一个loader最后执行，它返回Webpack期望的JavaScript代码。中间的loader会接收前一个loader的输出作为输入，并输出给下一个loader。

2、上下文对象（loaderContext）：loader函数接收到的参数中，this指向一个上下文对象，它提供了loader运行时的上下文信息和一些方法。
  如this.async()用于异步处理，this.cacheable()用于控制缓存，this.emitFile()用于生成额外的文件，this.addDependency()用于添加文件依赖等。

3、Pitching Loader：某些loader可以定义一个pitch方法，这个方法在loader链的normal阶段之前执行，并且是从左到右执行。
  如果某个pitch方法返回了一个值，那么它将中断loader链的执行，后面的loader将不会被执行，而是直接进入返回值的loader的normal阶段。

4、内联使用：在import语句中，可以通过添加特定前缀来覆盖配置中的loader，例如使用!前缀来禁用所有normal loader，或者使用!!前缀来禁用所有loader。

5、Loader API：Webpack提供了一些API，如loader-utils，它可以帮助loader之间进行通信，例如获取loader选项、解析文件名模板等。
```

##### 常用loader
```javascript
以下是一些常用的webpack loader：

babel-loader：用于将ES6+的JavaScript代码转换为ES5代码，以便在旧版本浏览器中运行。

css-loader：用于解析CSS文件，并处理其中的import和url()等语法。

style-loader：将解析后的CSS代码以<style>标签的形式插入到HTML文件中。

file-loader：用于处理文件资源（如图片、字体等），并将其复制到输出目录中。

url-loader：类似于file-loader，但可以根据文件大小将文件转换为DataURL，以减少HTTP请求。

sass-loader：用于将Sass/SCSS代码转换为CSS代码。

less-loader：用于将Less代码转换为CSS代码。

postcss-loader：用于对CSS代码进行后处理，如自动添加浏览器前缀等。

vue-loader：用于解析和转换Vue单文件组件。

ts-loader：用于将TypeScript代码转换为JavaScript代码。
```

##### 自定义loader
```javascript
// 核心代码：

function clearConsoleLoader(source) {
  // 使用正则表达式匹配并替换console语句
  const modifiedSource = source.replace(/console\.[a-z]+\(.+\);?/g, '');

  return modifiedSource;
}

module.exports = clearConsoleLoader;

//使用
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          'babel-loader',
          './path/to/clearConsoleLoader.js'
        ]
      }
    ]
  }
};
```

# webpack中的plugins（本质是类）
##### 工作原理
```javascript
webpack 插件是用来扩展 webpack 功能的工具，它可以在 webpack 构建过程中的不同阶段执行一些额外的操作。

插件的工作原理是通过在 webpack 的构建过程中的不同生命周期中注册一些钩子函数，然后在对应的阶段执行这些钩子函数中的逻辑。

webpack 的构建过程中有以下几个生命周期：

	初始化阶段：在这个阶段，webpack 会初始化配置参数，加载插件，并准备开始编译。

	编译阶段：在这个阶段，webpack 会从入口文件开始递归解析所有的依赖模块，并将模块转换成 AST（抽象语法树），然后根据配置文件中的规则进行转换和处理。

	完成编译阶段：在这个阶段，webpack 已经完成了所有的模块的转换和处理，并且生成了最终的输出文件。

	输出阶段：在这个阶段，webpack 会将生成的输出文件写入到磁盘上。

插件可以在这些生命周期中的任意阶段注册对应的钩子函数，并在钩子函数中执行一些额外的操作。
```

##### 自定义plugins
```javascript
class RemoveCommentsPlugin {
  apply(compiler) {
    compiler.hooks.emit.tap('RemoveCommentsPlugin', (compilation) => {
      Object.keys(compilation.assets).forEach(name => {
        if (name.endsWith('.js')) {
          const source = compilation.assets[name].source();
          
          // 正则匹配所有注释（包含多行、单行、块级注释）
          const regex = /(\/\*[\w\W]*?\*\/)|(\/\/.*)/g;
          const newSource = source.replace(regex, '');
          
          compilation.assets[name] = {
            source: () => newSource,
            size: () => newSource.length
          };
        }
      });
    });
  }
}

module.exports = RemoveCommentsPlugin;

// 使用

const RemoveCommentsPlugin = require('./RemoveCommentsPlugin.js');

module.exports = {
  // ...
  plugins: [
    new RemoveCommentsPlugin(),
  ],
};
```

# 打包过程
```javascript
读取配置文件：Webpack会首先读取配置文件，根据配置文件中的入口、出口等信息进行打包。

解析模块依赖：Webpack会从指定的入口文件开始递归解析所有的模块依赖，直到找到所有的模块。

加载器处理：对于不同类型的模块，Webpack会使用相应的加载器对其进行处理。例如，对于JavaScript模块，Webpack会使用Babel加载器将ES6语法转换为ES5语法；对于CSS模块，Webpack会使用CSS加载器将CSS代码打包进JS文件中。

插件处理：在模块加载完成之后，Webpack会执行一系列插件，用于完成一些额外的任务，例如生成HTML文件、提取CSS文件等。

编译打包：Webpack将经过处理的模块和插件生成最终的打包文件。通常情况下，Webpack会生成一个或多个JavaScript文件，同时也可以生成其他类型的文件，例如CSS、图片等。

输出打包文件：Webpack将生成的打包文件输出到指定的目录中。通常情况下，Webpack会将打包文件输出到dist目录下。
```

## 加速webpack打包速度和减小打包体积的优化
```plain
1. 优化Webpack配置：使用Tree shaking来减小打包体积，设置Webpack的mode为production以启用UglifyJsPlugin等插件进行代码压缩和优化。

2. 使用Webpack的code splitting功能：将代码分割成较小的块，以便在需要时动态加载。

3. 压缩图片和字体文件：使用ImageMinWebpackPlugin和FontminWebpackPlugin等插件来压缩图片和字体文件，减小打包体积。

4. 缓存：启用Webpack的缓存功能，以便在修改代码时只重新打包修改的文件，而不是重新打包所有文件。

5. 使用DLLPlugin和DllReferencePlugin：将一些第三方库打包成单独的文件，以便在每次打包应用程序时不必重新打包这些库。

6. 使用HappyPack插件：使用多线程来加速Webpack打包，以便同时处理多个任务。

7. 使用externals选项：将一些不需要打包的库从打包中排除，以便减小打包体积。

8. 使用Webpack-bundle-analyzer插件：分析打包后的文件，以便找出冗余的代码和依赖关系，进行优化。

这些技巧可以帮助优化Webpack的打包速度和打包体积。
```

## webpack配置
```javascript
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin"); // 自动引入资源插件  npm install --save-dev html-webpack-plugin
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // css抽离
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");  //css压缩 npm install css-minimizer-webpack-plugin  --save-dev 
const TerserPlugin = require("terser-webpack-plugin"); // js压缩  npm install --save-dev terser-webpack-plugin
//加载toml、yaml、json5数据资源 npm install toml yaml json5 -D
const toml = require("toml");
const yaml = require("yaml");
const json5 = require("json5");

module.exports = (env) => {
  return {
    // 手动分离公共文件，通过配置成对象的方式实现多入口代码分割
    // entry: {
    //  index:{
    //    import:"./src/index.js",
    //    dependOn: "shared"  // 抽离公共文件
    //  },
    //  shared: "lodash"      // 公共的js文件
    // },
    // 多入口
  	// entry: {
    // 	 pageOne: './src/pageOne/index.js',
    //  	pageTwo: './src/pageTwo/index.js',
    //  	pageThree: './src/pageThree/index.js',
  	// },
    // 单入口
    entry: {
      index: "./src/index.js",
    },
    output: {
      filename: "scripts/[name].[contenthash].js", // 将所有的js放入同一个文件夹，并且根据文件名自动命名
      path: path.resolve(__dirname, "./dist"),
      clean: true, // 清除上一次的垃圾文件
      assetModuleFilename: "images/[contenthash][ext]", // 在images目录下，根据文件内容自动生成hash文件名
      publicPath: "https://*****.com/", // 公共路径（cdn域名或者本地localhost）
    },
    mode: env.production ? "production" : "development", // 生产环境或者开发环境 package.json 启动命令：npx webpack --env production
    devtool: "cheap-module-source-map",     // 真实报错文件指向,生产环境一般不开启sourcemap
    // 插件（非必要的，缺少也不影响项目打包）
    plugins: [
      new HtmlWebpackPlugin({
        template: "./index.html", // 模板
        filename: "app.html",
        inject: "body", // script 存在的位置
        hash: true, // 解决缓存
        minify: {
          removeAttributeQuotes: true, // 压缩，去掉引号
        },
      }),
      new MiniCssExtractPlugin({
        filename: "style/[contenthash].css",
      }),
    ],
    devServer: {
      static: "./dist", // 监听根目录文件变化，自动刷新页面插件 npm install --save-dev webpack-dev-server
      //反向代理
      proxy: {
        "/ajax": {
          target: "https:**********",
          ws: true,
          changeOrigin: true,
        },
      },
    },
    // 模块（必要的，缺少影响项目打包）
    module: {
      rules: [
        //资源模块类型我们称之为Asset Modules Type，总共有四种，来代替loader，分别是：
        // asset/resource：发送一个单独的文件并导出URL，替代file-loader
        // asset/inline：导出一个资源的data URI(base64)，替代url-loader
        // asset/source：导出资源的源代码，之前通过使用raw-loader实现
        // asset：介于asset/resource和asset/inline之间， 之前通过url-loader+limit属性实现。
        {
          test: /\.(png|gif|jp?g|svg|webp|ico)$/, // 正则图片文件
          type: "asset",
          generator: {
            filename: "images/[contenthash][ext]", // 优先级高于 assetModuleFilename
          },
        },
        {
          // 支持less
          // npm install style-loader css-loader less-loader less --save-dev
          // 抽离 npm install mini-css-extract-plugin  --save-dev   webpack5环境下构建的插件
          test: /\.(le|c)ss$/, // .less and .css
          use: [MiniCssExtractPlugin.loader,/* "style-loader", */ "css-loader","less-loader"],
        },
        {
          test: /\.(woff|woff2|eot|ttf|oft)$/, // 正则字体文件
          type: "asset/resource",
        },
        //加载csv、xml数据资源 npm install csv-loader xml-loader -D
        {
          test: /\.(csv|tsv)$/,
          use: "csv-loader",
        },
        {
          test: /\.xml$/,
          use: "xml-loader",
        },
        //加载toml、yaml、json5数据资源
        {
          test: /\.toml$/,
          type: "json",
          parser: {
            parse: toml.parse,
          },
        },
        {
          test: /\.yaml$/,
          type: "json",
          parser: {
            parse: yaml.parse,
          },
        },
        {
          test: /\.json5$/,
          type: "json",
          parser: {
            parse: json5.parse,
          },
        },
        // loader工具 支持数组方式链式调用，数组靠后的元素先执行
        {
          // 压缩图片
          //图片小于一定大小使用base64 否则使用file-loader产生真实图片 npm install url-loader --save-dev
          test: /\.(png|gif|jp?g|svg|webp|ico)$/, // 正则
          use: [
            {
              loader: "url-loader",
              options: {
                limit: 5000, //小于限定使用base64
                name: "home/images/[name].[hash:8].[ext]",
                publicPath: `../../`,
                esModule: false,
              },
            },
          ],
        },
        // 使用babel-loader npm install -D babel-loader @babel/core @babel/preset-env
        // regeneratorRuntime是webpack打包生成的全局辅助函数，由babel生成，用于兼容 async/await 的语法
        // npm install --save @babel/runtime
        // npm install --save-dev @babel/plugin-transform-runtime
        {
          test: /\.js$/,
          exclude: /node_modules/, // *业务代码里面可能会引入node_modules外部js，这些js不需要babel-loader编译，因此需要排除掉
          use: {
            loader: "babel-loader", // *引入babel-loader
            options: {
              presets: ["@babel/preset-env"], // *引入预设
              plugins: [
                [
                  "@babel/plugin-transform-runtime", // *配置插件信息
                ],
              ],
            },
          },
        },
      ],
    },
    optimization: {
      minimizer: [new CssMinimizerPlugin(),new TerserPlugin()],   //代码压缩 mode改为 production
      splitChunks: {
        // 缓存
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all", // 自动重复代码抽离
          },
        },
      },
    },
  };
};
```

## webpack配置拆分
##### webpack.config.common.js文件公共环境配置 
```javascript
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin"); // 自动引入资源插件  npm install --save-dev html-webpack-plugin
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // css抽离
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin"); //css压缩 npm install css-minimizer-webpack-plugin  --save-dev
const TerserPlugin = require("terser-webpack-plugin"); // js压缩  npm install --save-dev terser-webpack-plugin
//加载toml、yaml、json5数据资源 npm install toml yaml json5 -D
const toml = require("toml");
const yaml = require("yaml");
const json5 = require("json5");

module.exports = {
  entry: {
    index: "./src/index.js",
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    clean: true, // 清除上一次的垃圾文件
    assetModuleFilename: "images/[contenthash][ext]", // 在images目录下，根据文件内容自动生成hash文件名
  },
  // 插件（非必要的，缺少也不影响项目打包）
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html", // 模板
      filename: "app.html",
      inject: "body", // script 存在的位置
      hash: true, // 解决缓存
      minify: {
        removeAttributeQuotes: true, // 压缩，去掉引号
      },
    }),
    new MiniCssExtractPlugin({
      filename: "style/[contenthash].css",
    }),
  ],
  // 模块（必要的，缺少影响项目打包）
  module: {
    rules: [
      //资源模块类型我们称之为Asset Modules Type，总共有四种，来代替loader，分别是：
      // asset/resource：发送一个单独的文件并导出URL，替代file-loader
      // asset/inline：导出一个资源的data URI(base64)，替代url-loader
      // asset/source：导出资源的源代码，之前通过使用raw-loader实现
      // asset：介于asset/resource和asset/inline之间， 之前通过url-loader+limit属性实现。
      {
        test: /\.(png|gif|jp?g|svg|webp|ico)$/, // 正则图片文件
        type: "asset",
        generator: {
          filename: "images/[contenthash][ext]", // 优先级高于 assetModuleFilename
        },
      },
      {
        // 支持less
        // npm install style-loader css-loader less-loader less --save-dev
        // 抽离 npm install mini-css-extract-plugin  --save-dev   webpack5环境下构建的插件
        test: /\.(le|c)ss$/, // .less and .css
        use: [
          MiniCssExtractPlugin.loader,
          /* "style-loader", */ "css-loader",
          "less-loader",
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|oft)$/, // 正则字体文件
        type: "asset/resource",
      },
      //加载csv、xml数据资源 npm install csv-loader xml-loader -D
      {
        test: /\.(csv|tsv)$/,
        use: "csv-loader",
      },
      {
        test: /\.xml$/,
        use: "xml-loader",
      },
      //加载toml、yaml、json5数据资源
      {
        test: /\.toml$/,
        type: "json",
        parser: {
          parse: toml.parse,
        },
      },
      {
        test: /\.yaml$/,
        type: "json",
        parser: {
          parse: yaml.parse,
        },
      },
      {
        test: /\.json5$/,
        type: "json",
        parser: {
          parse: json5.parse,
        },
      },
      // loader工具 支持数组方式链式调用，数组靠后的元素先执行
      {
        // 压缩图片
        //图片小于一定大小使用base64 否则使用file-loader产生真实图片 npm install url-loader --save-dev
        test: /\.(png|gif|jp?g|svg|webp|ico)$/, // 正则
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 5000, //小于限定使用base64
              name: "home/images/[name].[hash:8].[ext]",
              publicPath: `../../`,
              esModule: false,
            },
          },
        ],
      },
      // 使用babel-loader npm install -D babel-loader @babel/core @babel/preset-env
      // regeneratorRuntime是webpack打包生成的全局辅助函数，由babel生成，用于兼容 async/await 的语法
      // npm install --save @babel/runtime
      // npm install --save-dev @babel/plugin-transform-runtime
      {
        test: /\.js$/,
        exclude: /node_modules/, // *业务代码里面可能会引入node_modules外部js，这些js不需要babel-loader编译，因此需要排除掉
        use: {
          loader: "babel-loader", // *引入babel-loader
          options: {
            presets: ["@babel/preset-env"], // *引入预设
            plugins: [
              [
                "@babel/plugin-transform-runtime", // *配置插件信息
              ],
            ],
          },
        },
      },
    ],
  },
  optimization: {
    splitChunks: {
      // 缓存
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all", // 自动重复代码抽离
        },
      },
    },
  },
};
```

##### webpack.config.dev.js文件开发环境配置 npx webpack -c ./webpack.config.dev.js
```javascript
module.exports = {
  output: {
    filename: "scripts/[name].js", // 将所有的js放入同一个文件夹，并且根据文件名自动命名
  },
  mode: "development", // 生产环境或者开发环境 package.json 启动命令：npx webpack --env production
  devtool: "cheap-module-source-map", // 真实报错文件指向,生产
  devServer: {
    static: "./dist", // 监听根目录文件变化，自动刷新页面插件 npm install --save-dev webpack-dev-server
    //反向代理
    proxy: {
      "/ajax": {
        target: "https:**********",
        ws: true,
        changeOrigin: true,
      },
    },
  },
};
```

##### webpack.config.prod.js文件生产环境配置 npx webpack -c ./webpack.config.prod.js
```javascript
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");  //css压缩 npm install css-minimizer-webpack-plugin  --save-dev 
const TerserPlugin = require("terser-webpack-plugin"); // js压缩  npm install --save-dev terser-webpack-plugin

module.exports = {
  output: {
    filename: "scripts/[name].[contenthash].js", // 将所有的js放入同一个文件夹，并且根据文件名自动命名
    publicPath: "https://*****.com/", // 公共路径（cdn域名或者本地localhost）
  },
  mode: "production", // 生产环境或者开发环境 package.json 启动命令：npx webpack --env production
  optimization: {
    minimizer: [new CssMinimizerPlugin(), new TerserPlugin()], //代码压缩 mode改为 production
  },
  performance: {
    hints: false, // 关闭性能提示
  },
};
```

##### webpack.config.js 运行：webpack -c ./webpack.config.js --env development
```javascript
const { merge } = require ('webpack-merge')   // npm install webpack-merge -D
const commonConfig = require ('./webpack.config.common')
const productionConfig = require ('./webpack.config.prod')
const developmentConfig = require ('./webpack.config.dev')

module.exports = (env) => {
  switch (true) {
    case env.development :
      return merge(commonConfig,developmentConfig)
    case env.production :
      return merge(commonConfig,productionConfig)
    default:
      return new Error()
  }
}
```

## 封装webpack自定义插件
```javascript
1. 创建一个 JavaScript 文件，并导出一个函数。这个函数将作为你的插件的构造函数。

2. 在函数中定义一个 apply 方法，该方法接收一个 compiler 参数。这个 compiler 对象是 Webpack 的核心，它包含了 Webpack 的所有配置和工作流程。

3. 在 apply 方法中，可以通过 compiler.hooks 对象访问 Webpack 的生命周期钩子。通过这些钩子，你可以在 Webpack 运行的不同阶段执行自定义代码。

4. 实现你的插件逻辑，例如在特定的 Webpack 钩子上注册回调函数，向编译器添加自定义插件等。

5. 将你的插件打包成一个 npm 模块，并在项目中引入和使用它。

下面是一个简单的 Webpack 插件示例：

const MyPlugin = function() {};

MyPlugin.prototype.apply = function(compiler) {
  compiler.hooks.done.tap('MyPlugin', stats => {
    console.log('Webpack is done!');
  });
};

module.exports = MyPlugin;

在这个示例中，我们定义了一个 MyPlugin 插件，它在 Webpack 编译完成后输出一条信息。
在 apply 方法中，我们使用 compiler.hooks.done 钩子注册了一个回调函数，在编译完成后输出一条消息。

要使用这个插件，你需要将它打包成一个 npm 模块，并在 Webpack 配置文件中引入和使用它：

const MyPlugin = require('my-plugin');

module.exports = {
  plugins: [
    new MyPlugin()
  ]
};

这个示例中，我们在 Webpack 配置文件中引入了 MyPlugin 插件，并将它作为插件数组的一项传递给 plugins 选项。
这样，当 Webpack 编译时，MyPlugin 将会被启用并执行它的逻辑。
```

# Webpack 与 Vite 对比

##### 核心区别
| 特性 | Webpack | Vite |
| :---: | :---: | :---: |
| **开发模式** | 打包后启动（Bundle-based） | 按需编译（No-bundle，基于 ESM） |
| **启动速度** | 慢（需先打包整个项目） | 极快（利用浏览器原生 ESM，无需打包） |
| **HMR 速度** | 随项目增大变慢 | 始终快速（精确更新修改的模块） |
| **生产构建** | Webpack 自身 | Rollup（更高效的 Tree Shaking） |
| **配置复杂度** | 高（需大量 loader/plugin 配置） | 低（开箱即用，约定优于配置） |
| **生态系统** | 极其丰富（成熟、稳定） | 快速增长（兼容大部分 Rollup 插件） |
| **浏览器兼容** | 支持旧浏览器（IE11+） | 需要现代浏览器（ES2015+） |
| **适用场景** | 大型复杂项目、需要精细控制 | 中小型项目、追求开发体验 |

##### Vite 为什么快
```javascript
// 1. 开发模式下不打包
//    Webpack：将所有模块打包成 bundle 后再启动 dev server
//    Vite：直接启动 dev server，利用浏览器原生 ESM 按需请求模块

// 2. 依赖预构建（Pre-bundling）
//    Vite 使用 esbuild（Go 编写，比 JS 快 10-100 倍）对 node_modules 中的依赖进行预构建
//    将 CommonJS/UMD 转换为 ESM 格式，并合并小模块减少 HTTP 请求

// 3. HMR 原理不同
//    Webpack：重新构建依赖图中受影响的模块链
//    Vite：精确定位到修改的模块，通过 ESM 动态导入替换，不受项目规模影响

// 4. 生产构建使用 Rollup
//    Rollup 的 Tree Shaking 更彻底，输出更小的包体积
//    支持代码分割、动态导入等优化策略
```

##### Vite 基本配置
```javascript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],  // 分离第三方库
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
```

##### 何时选择 Webpack vs Vite
```javascript
// 选择 Webpack：
// - 需要支持 IE11 等旧浏览器
// - 已有大型项目，迁移成本高
// - 需要复杂的自定义构建流程
// - 依赖 Webpack 特有的 loader/plugin 生态

// 选择 Vite：
// - 新项目，追求极致的开发体验
// - 项目只需支持现代浏览器
// - 使用 React/Vue/Svelte 等主流框架
// - 中小型项目，希望零配置快速启动
```
