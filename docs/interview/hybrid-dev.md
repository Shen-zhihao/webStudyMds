---
title: "混合开发问题"
sidebar_position: 4
---

# RN热更步骤
+ IOS 版本控制 ios/项目名/Info.plist 中的 CFBundleShortVersionString
+ ANDROID 版本控制 android/app/build.gralde 中的 versionName (新的提审包要更新versionCode)
+ 安装 npm i -g react-native-update-cli
+ 执行 pushy login 输入 email 和密码
+ 执行 pushy selectApp --platform ios 绑定 ios app
+ 执行 pushy selectApp --platform android 绑定 android app
+ 发布基准版本 app，后续热更新基于此进行差异比对 （已有基准版本则忽略此步骤）
    1. ios: pushy uploadIpa <ipa 后缀文件>
    2. android: pushy uploadApk android/app/build/outputs/apk/release/app-release.apk
    3. (蒲公英上的版本需要与这里上传的 app 相同)
+ 发布热更新版本，随后输入版本信息，一路 Y 即可
    1. ios: pushy bundle --platform ios
    2. android: pushy bundle --platform android
    3. (后续要继续发布新的热更新，只需反复执行 pushy bundle 命令即可)

# RN 与原生之间通信
### ⚡ 一、RN 调用原生代码的三种方式
1. **原生模块调用（最常用）**
**原理**：在原生端封装模块，通过 `@ReactMethod`（Android）或 `RCT_EXPORT_METHOD`（iOS）暴露方法，RN 通过 `NativeModules` 调用。

```java
public class MyModule extends ReactContextBaseJavaModule {
    @ReactMethod
    public void showToast(String message) {
        Toast.makeText(getReactApplicationContext(), message, Toast.LENGTH_SHORT).show();
    }
}
```

```javascript
import { NativeModules } from 'react-native';
NativeModules.MyModule.showToast('Hello from RN!');
```

**适用场景**：调用摄像头、传感器等平台特定功能。

2. **回调函数（Callback）**
**原理**：RN 调用原生方法时传入回调函数，原生代码执行完毕后通过回调返回结果。

```objectivec
RCT_EXPORT_METHOD(getData:(RCTResponseSenderBlock)callback) {
    callback(@[@"Data from native"]);
}
```

```javascript
NativeModules.MyModule.getData((data) => console.log(data));
```

**注意**：回调仅能调用一次，多次调用可能导致异常。

3. **Promise 机制**
**原理**：原生方法返回 Promise 对象，RN 使用 `then/catch` 处理结果。

```java
@ReactMethod
public void fetchData(Promise promise) {
try {
    promise.resolve("Success");
} catch (Exception e) {
    promise.reject("Error", e);
}
}
```

```javascript
NativeModules.MyModule.fetchData().then(console.log).catch(console.error);
```

**优势**：更适合处理异步操作（如网络请求）

---

### 📡 二、原生主动通知 RN
1. **事件发射（EventEmitter）**
**原理**：原生代码继承 `RCTEventEmitter`，通过 `sendEventWithName` 发送事件，RN 通过 `NativeEventEmitter`监听。

```objectivec
- (NSArray<NSString *> *)supportedEvents {
    return @[@"onScanResult"];
}
- (void)sendResult:(NSString *)result {
    [self sendEventWithName:@"onScanResult" body:result];
}
```

```javascript
const eventEmitter = new NativeEventEmitter(NativeModules.MyModule);
eventEmitter.addListener('onScanResult', (data) => alert(data));
```

**适用场景**：蓝牙扫描、实时定位等持续数据流。

---

### 🌉 三、通信机制的核心原理
1. **桥接（Bridge）**
    - **异步通信**：所有通信通过 JSON 消息队列传递，避免阻塞主线程。
    - **三线程模型**：
        * **JS 线程**：运行 JavaScript 代码。
        * **原生线程**：处理 UI 渲染和原生模块。
        * **Shadow 线程**：计算布局差异（Virtual DOM 对比）。
2. **性能优化**
    - **Hermes 引擎**：预编译 JavaScript 提升启动速度。
    - **JSI（JavaScript Interface）**：允许直接访问原生内存，减少序列化开销（React Native 新架构特性）。

---

### 💎 四、各通信方式对比
| **方式** | **方向** | **适用场景** | **性能影响** |
| --- | --- | --- | --- |
| 原生模块调用 | RN → 原生 | 单次功能调用（如打开相机） | 低 |
| 回调函数/Promise | RN ↔ 原生 | 需要返回结果的异步操作 | 中 |
| 事件发射 | 原生 → RN | 持续事件通知（如传感器数据） | 中高（需管理监听） |


# 判断用户是 PC 还是移动端
```javascript
​实验性API（谨慎使用，仅支持Chrome 89+）
if (navigator.userAgentData?.mobile) {
    return 'Mobile';
}

​多条件联合判断
function detectDevice() {
    const ua = navigator.userAgent.toLowerCase();
    const isMobileUA = /android|iphone|ipad|mobi|harmony|iemobile|opera mini/i.test(ua);
    const isSmallScreen = window.innerWidth < 768;
    const hasTouch = 'ontouchstart' in window;
    return isMobileUA || isSmallScreen || hasTouch;
}
```

# 如何优化 h5 加载速度
## 一、核心原则：**减少体积 + 减少请求数 + 提前关键资源**
## 二、前端资源优化
### ✅ 1. **压缩与精简资源**
+ **JS/CSS**：
    - 使用 **Terser（JS）**、**CSSNano（CSS）** 压缩。
    - 移除 console.log、注释、未使用代码（Tree Shaking）。
+ **图片**：
    - 优先使用 **WebP**（比 JPEG/PNG 小 25%~35%），降级用 JPEG/PNG。
    - 使用工具压缩：`Squoosh`、`tinypng`、`imagemin`。
    - 合理尺寸：避免上传 4000px 图片只显示 200px。
+ **字体**：
    - 只加载需要的字重和字符集（如中文用 `font-display: swap` + 子集化）。

### ✅ 2. **代码分割 & 按需加载**
+ 使用 **动态 import()** 拆分路由或功能模块（Webpack/Vite 支持）。
+ 非首屏组件（如弹窗、评论区）懒加载。

### ✅ 3. **启用 Gzip / Brotli 压缩**
+ 在 Nginx/Apache 或 CDN 上开启：

```nginx
gzip on;
gzip_types text/css application/javascript image/svg+xml;
```

+ Brotli 比 Gzip 再小 15%~20%（需服务器支持）。

## 三、网络请求优化
### ✅ 4. **减少 HTTP 请求数**
+ **合并小图标** → 使用 **雪碧图（Sprite）** 或 **Icon Font / SVG Symbol**。
+ **内联关键 CSS/JS**（首屏必需的小资源）：

### ✅ 5. **使用 CDN 加速静态资源**
+ 将 JS/CSS/图片部署到 CDN，利用边缘节点就近访问。
+ 设置长期缓存（`Cache-Control: max-age=31536000`）+ 文件名哈希（`app.a1b2c3.js`）。

### ✅ 6. **预加载关键资源（Preload / Prefetch）**
+ `**<link rel="preload">**`：提前加载首屏关键资源（字体、首屏图片、核心 JS）。

```html
<link rel="preload" href="/critical.js" as="script">
<link rel="preload" href="/font.woff2" as="font" type="font/woff2" crossorigin>
```

+ `**<link rel="prefetch">**`：空闲时预加载后续可能用到的资源（如下一页）。

## 四、渲染性能优化
### ✅ 7. **优化关键渲染路径（CRP）**
+ **CSS 放在**** **`**<head>**`，避免 FOUC（无样式内容闪烁）。
+ **JS 放在**** **`**</body>**`** ****前** 或加 `defer`，避免阻塞 HTML 解析。
+ **避免长任务**：将大计算拆分为 `requestIdleCallback` 或 Web Worker。

### ✅ 8. **首屏直出（服务端渲染 SSR / 静态生成 SSG）**
+ 使用 **Next.js（React）**、**Nuxt.js（Vue）** 或自建 SSR。
+ 优势：首屏 HTML 包含内容，无需等 JS 执行即可展示。

若无法 SSR，至少做 **骨架屏（Skeleton Screen）** 提升感知速度。

### ✅ 9. **图片懒加载（非首屏）**
+ 使用原生 `loading="lazy"`（现代浏览器支持）：

```html
<img src="image.jpg" loading="lazy" alt="...">
```

+ 或 Intersection Observer + 占位图。

## 五、缓存策略
### ✅ 10. **合理设置 HTTP 缓存**
| 资源类型 | 缓存策略 |
| --- | --- |
| HTML | `Cache-Control: no-cache`<br/>（每次验证） |
| JS/CSS/图片（带 hash） | `Cache-Control: max-age=31536000, immutable` |
| API 数据 | `Cache-Control: no-store`<br/> 或短时间缓存 |


### ✅ 11. **Service Worker 缓存（PWA）**
+ 缓存静态资源，实现离线访问和秒开。
+ 使用 Workbox 库快速集成。

## 六、监控与分析
### ✅ 12. **使用性能分析工具**
+ **Lighthouse**（Chrome DevTools）：评分 + 优化建议。
+ **WebPageTest**：多地点测速、瀑布流分析。
+ **Performance API**：监控真实用户性能（FCP、LCP、FID）。

```javascript
const fcp = performance.getEntriesByName('first-contentful-paint')[0];
```

### ✅ 13. **关键指标监控**
+ **FCP（First Contentful Paint）** < 1.8s
+ **LCP（Largest Contentful Paint）** < 2.5s
+ **TTI（Time to Interactive）** < 3.5s

## 七、其他实用技巧
+ **移除未使用的第三方 SDK**（如多个统计脚本）。
+ **避免重定向**（如 `http → https → www` 多跳）。
+ **DNS 预解析**：`<link rel="dns-prefetch" href="//cdn.example.com">`
+ **TCP 预连接**：`<link rel="preconnect" href="https://api.example.com">`

## 🚀 总结：H5 加载优化 Checklist
| 类别 | 措施 |
| --- | --- |
| **资源体积** | 压缩 JS/CSS/图片、启用 Brotli、代码分割 |
| **请求数量** | 合并资源、CDN、缓存 |
| **关键路径** | 内联关键 CSS、defer JS、preload 关键资源 |
| **渲染体验** | 骨架屏、懒加载、避免长任务 |
| **高级方案** | SSR、PWA、HTTP/2（多路复用） |


# 什么是 js bridge
JSBridge 的本质是 **利用 WebView 的双向通信能力，在受限的 Web 环境中打通原生能力**，是混合开发（Hybrid App）的核心技术之一。

## 为什么需要 JSBridge？
+ 浏览器环境受限：H5 无法直接访问摄像头、蓝牙、文件系统等原生能力。
+ App 内嵌 WebView：很多功能用 H5 开发更灵活、热更新快，但需原生支持。
+ 双向交互需求：如 App 主动通知 H5 页面刷新、推送消息等。

---

## 核心通信原理
JSBridge 的实现依赖于 **WebView 提供的"注入"和"拦截"机制**：

| 方向 | 实现方式 |
| --- | --- |
| **H5 → 原生** | 通过特定 URL scheme 或注入的全局对象调用原生方法 |
| **原生 → H5** | 通过 WebView 的 `evaluateJavascript()`（iOS）或 `loadUrl("javascript:...")`（Android）执行 JS |


## 总结
| 方向 | 技术手段 |
| --- | --- |
| **H5 → 原生** | URL Scheme 拦截 或 注入全局对象（推荐） |
| **原生 → H5** | `evaluateJavascript()`<br/> 执行 JS |
| **异步回调** | 通过 callbackId + 全局回调函数实现 |
| **安全** | 白名单 + 来源校验 + 参数过滤 |


# WebView 性能优化
### 常见优化手段
1. **WebView 预创建与复用**
   - 提前初始化 WebView 池，避免每次打开页面都创建新的 WebView 实例
   - 减少 WebView 初始化耗时（Android 首次创建 WebView 约 500ms~1500ms）

2. **离线包方案**
   - 将 H5 资源（HTML/CSS/JS/图片）打包为离线包，随 App 下发
   - 加载时优先读取本地资源，减少网络请求
   - 配合增量更新，仅下载差异部分

3. **预加载与预渲染**
   - 在 WebView 不可见时提前加载 URL
   - 使用预渲染（Prerender）技术，提前生成 DOM

4. **NSURLProtocol / WebViewClient 拦截**
   - 拦截 WebView 的资源请求，返回本地缓存资源
   - 适用于图片、字体等静态资源的加载优化

### 白屏时间优化
```
白屏时间 = WebView 初始化 + DNS + TCP + HTTP请求 + 页面解析渲染

优化方向：
├── WebView 初始化优化 → 预创建 WebView 池
├── 网络优化 → DNS 预解析、连接复用、离线包
├── 页面渲染优化 → SSR、骨架屏、关键 CSS 内联
└── 资源加载优化 → CDN、缓存、资源预加载
```

# Hybrid App 三种开发模式对比
| 特性 | WebView（H5） | React Native / Weex | Flutter |
| --- | --- | --- | --- |
| **渲染方式** | WebView 渲染 HTML | 原生控件渲染 | 自绘引擎（Skia） |
| **性能** | 较低 | 接近原生 | 接近原生 |
| **热更新** | 天然支持 | 支持（如 Pushy、CodePush） | 官方不支持 |
| **开发语言** | HTML/CSS/JS | JavaScript/TypeScript | Dart |
| **学习成本** | 低 | 中 | 中高 |
| **适用场景** | 内容展示、活动页 | 复杂交互型 App | 高性能跨端 App |

# 小程序与 H5 的区别
### 运行环境
```javascript
小程序：
  - 渲染层使用 WebView 渲染，逻辑层使用 JSCore/V8 执行 JS
  - 双线程模型：渲染线程和逻辑线程分离
  - 无法直接操作 DOM，通过 setData 更新视图

H5：
  - 运行在浏览器中，单线程模型
  - 可以直接操作 DOM
  - 拥有完整的浏览器 API（如 localStorage、history 等）
```

### 主要区别
| 特性 | 小程序 | H5 |
| --- | --- | --- |
| **入口** | 无需安装，扫码/搜索即用 | 需要输入 URL 或点击链接 |
| **体积限制** | 主包 2MB，分包 20MB | 无限制 |
| **API 能力** | 受限于宿主 App 提供的 API | 拥有完整浏览器 API |
| **审核机制** | 需要平台审核 | 无需审核 |
| **离线能力** | 支持（本地缓存） | 需要 Service Worker |
| **分享能力** | 内置社交分享（如微信） | 需要借助 SDK |

# 移动端适配方案
### 常见方案
```css
/* 1. rem 方案（flexible.js） */
html { font-size: calc(100vw / 7.5); }  /* 以 750px 设计稿为基准 */
.box { width: 3.75rem; }  /* 等于 375px 设计稿中的一半宽度 */

/* 2. vw/vh 方案（推荐） */
.box {
  width: 50vw;      /* 视口宽度的 50% */
  height: 25vh;     /* 视口高度的 25% */
  font-size: 4.267vw; /* 750 设计稿中 32px = 32/750*100 */
}

/* 3. 媒体查询 */
@media screen and (max-width: 768px) {
  .container { padding: 10px; }
}
@media screen and (min-width: 769px) and (max-width: 1024px) {
  .container { padding: 20px; }
}
```

### 1px 问题
```css
/* 在 Retina 屏上 1px CSS 像素会显示为 2px 或 3px 物理像素 */

/* 方案一：伪元素 + transform */
.border-1px::after {
  content: '';
  position: absolute;
  left: 0; bottom: 0;
  width: 100%;
  height: 1px;
  background: #000;
  transform: scaleY(0.5);
  transform-origin: 0 0;
}

/* 方案二：使用 0.5px（仅 iOS 8+ 支持） */
.border { border-width: 0.5px; }

/* 方案三：使用 viewport 缩放 */
<meta name="viewport" content="initial-scale=0.5, maximum-scale=0.5, minimum-scale=0.5">
```
