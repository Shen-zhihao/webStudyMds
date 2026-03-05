---
title: "React 源码解读"
sidebar_position: 6
---

# 配置React源码本地调试环境
本次环境构建采用了node版本为16、react-scripts 版本号为 3.4.4，源码下载地址 [https://gitee.com/laborer996/react-source-code-debugging](https://gitee.com/laborer996/react-source-code-debugging)

```bash
npx create-react-app react-test
```

```bash
// 在 npm run eject 之前，手动将项目 package.json 里面 react-scripts 版本号改为低版本的 3.4.4，删除 node_modules 后重装，确保使用老版本脚手架
npm run eject
```

```bash
git clone --branch v16.13.1 --depth=1 https://github.com/facebook/react.git src/react
```

```javascript
// 文件位置: react-test/config/webpack.config.js
resolve: {
  alias: {
    "react-native": "react-native-web",
      "react": path.resolve(__dirname, "../src/react/packages/react"),
      "react-dom": path.resolve(__dirname, "../src/react/packages/react-dom"),
      "shared": path.resolve(__dirname, "../src/react/packages/shared"),
      "react-reconciler": path.resolve(__dirname, "../src/react/packages/react-reconciler"),
      "legacy-events": path.resolve(__dirname, "../src/react/packages/legacy-events"),
      'scheduler/tracing': path.resolve(__dirname, "../src/react/packages/scheduler/src/Tracing")
  }
}
```

```javascript
// 文件位置: react-test/config/env.js
const stringified = {
	"process.env": Object.keys(raw).reduce((env, key) => {
   	env[key] = JSON.stringify(raw[key])
      return env
   }, {}),
   __DEV__: true,
   SharedArrayBuffer: true,
   spyOnDev: true,
   spyOnDevAndProd: true,
   spyOnProd: true,
   __PROFILE__: true,
   __UMD__: true,
   __EXPERIMENTAL__: true,
   __VARIANT__: true,
   gate: true,
   trustedTypes: true
 }
```

```javascript
安装：npm install @babel/plugin-transform-flow-strip-types -D
// 文件位置: react-test/config/webpack.config.js [babel-loader]
找到： loader: require.resolve('babel-loader'),
plugins: [
 + require.resolve("@babel/plugin-transform-flow-strip-types"),
]
```

```javascript
// 文件位置: /react/packages/react-reconciler/src/ReactFiberHostConfig.js
+ export * from './forks/ReactFiberHostConfig.dom';
- invariant(false, 'This module must be shimmed by a specific renderer.');
```

```javascript
// 文件位置: /react/packages/shared/ReactSharedInternals.js
- import * as React from 'react';
- const ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
+ import ReactSharedInternals from '../react/src/ReactSharedInternals';
```

```javascript
// 文件位置: react/.eslingrc.js [module.exports]
// 注释 extends
- extends: [
-  'fbjs',
- 'prettier'
-]
```

```javascript
// 文件位置: /react/packages/shared/invariant.js
export default function invariant(condition, format, a, b, c, d, e, f) {
+  if (condition) return;
  throw new Error(
    'Internal React error: invariant() is meant to be replaced at compile ' +
      'time. There is no runtime version.',
  );
}
```

```json
{
  "extends": "react-app",
  "globals": {
    "SharedArrayBuffer": true,
    "spyOnDev": true,
    "spyOnDevAndProd": true,
    "spyOnProd": true,
    "__PROFILE__": true,
    "__UMD__": true,
    "__EXPERIMENTAL__": true,
    "__VARIANT__": true,
    "gate": true,
    "trustedTypes": true
  }
}
```

```javascript
import * as React from "react"
import * as ReactDOM from "react-dom"
```

```json
// vscode设置
"javascript.validate.enable": false
```

```bash
// 如果你的 vscode 编辑器安装了 prettier 插件并且在保存 react 源码文件时右下角出现如下错误，按照如下步骤解决
// 全局安装 prettier
npm i prettier -g
// 配置 prettier path
Settings > Extensions > Prettier > Prettier path
```

```bash
删除 node_modules 文件夹，执行 npm install
```

