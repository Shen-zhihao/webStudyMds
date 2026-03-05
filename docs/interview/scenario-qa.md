---
title: "场景相关问题"
sidebar_position: 3
---

# 进程与线程区别
+ 从本质上说，进程和线程都是 CPU 工作时间片的一个描述：
+ 进程是资源分配的最小单位，线程是CPU调度的最小单位。
+ **线程是进程中的更小单位**，描述了执行一段指令所需的时间。
+ 进程描述了 CPU 在运行指令及加载和保存上下文所需的时间，放在应用上来说就代表了一个程序。
+ 进程和线程之间的关系有以下四个特点：
+ （1）进程中的任意一线程执行出错，都会导致整个进程的崩溃。
+ （2）线程之间共享进程中的数据。
+ （3）当一个进程关闭之后，操作系统会回收进程所占用的内存， 当一个进程退出时，操作系统会回收该进程所申请的所有资源；即使其中任意线程因为操作不当导致内存泄漏，当进程退出时，这些内存也会被正确回收。
+ （4）进程之间的内容相互隔离。 进程隔离就是为了使操作系统中的进程互不干扰，每一个进程只能访问自己占有的数据，也就避免出现进程 A 写入数据到进程 B 的情况。正是因为进程之间的数据是严格隔离的，所以一个进程如果崩溃了，或者挂起了，是不会影响到其他进程的。如果进程之间需要进行数据的通信，这时候，就需要使用用于进程间通信的机制了。

# HTTP状态码
```javascript
以下是常见的HTTP状态码：

- 1xx：信息性状态码，表示请求已被接收，继续处理。
  - 100：继续
  - 101：切换协议

- 2xx：成功状态码，表示服务器成功接收、理解并处理了请求。
  - 200：OK
  - 201：已创建
  - 202：已接受
  - 204：无内容
  - 206：部分内容

- 3xx：重定向状态码，表示需要进一步操作才能完成请求。
  - 301：永久重定向
  - 302：临时重定向
  - 304：未修改

- 4xx：客户端错误状态码，表示服务器无法处理请求。
  - 400：错误的请求
  - 401：未授权
  - 403：禁止访问
  - 404：资源未找到
  - 405：通常是因为服务器未配置允许使用该方法，或者该方法与服务器不兼容导致的

- 5xx：服务器错误状态码，表示服务器在处理请求时发生错误。
  - 500：服务器内部错误
  - 502：错误的网关
  - 503：服务不可用
  - 504：网关超时

除了以上常见的状态码外，还有其他一些状态码用于表示不同的情况和错误，例如429表示请求过多，418表示I'm a teapot等。
每个状态码都有特定的含义，用于指示请求的处理状态。
```

# HTTP 1.0/1.1/2.0/3.0特性（多路复用）
**HTTP 1.0：**

+ 确定了协议是**无状态**的，即同一客户端每次请求都没有任何关系
+ 消息结构包含请求头和请求体

**HTTP 1.1：**

+ 引入了持久连接，即 TCP 连接默认不关闭，可以被**多个****请求复用**
+ 在同一个 TCP 连接里面，客户端可以同时**发送多个请求**
+ 虽然允许复用 TCP 连接，但是同一个TCP连接里面，所有的数据通信是按次序进行的，服务器只有处理完一个请求，才会接着处理下一个请求。
+ 新增了一些请求方法（如 PUT、DELETE 等）、新增一些请求头和响应头

**HTTP 2.0：**

+ 采用二进制格式而非文本格式
+ 完全多路复用，而非有序并阻塞的、只需一个连接即可实现**并行**
+ 使用报头压缩，降低开销
+ 支持服务器推送

**HTTP 3.0**

+ 弃用 TCP 协议，采用一种新的更快的网络协议 QUIC（基于 UDP 协议）

**总结**

HTTP/1.0及以下：每次请求独立握手/挥手

HTTP/1.1+：默认复用连接，显著减少握手次数

HTTP/2/3：通过多路复用和QUIC协议彻底优化连接管理

# tcp 和 udp 的区别和场景
### 核心区别对比
| 特性 | TCP | UDP |
| --- | --- | --- |
| **连接方式** | 面向连接（三次握手建立连接） | 无连接（直接发送数据） |
| **可靠性** | 可靠传输（确认、重传、排序） | 不可靠（不保证送达、不重传） |
| **传输顺序** | 保证数据按序到达 | 不保证顺序 |
| **头部开销** | 较大（20字节起） | 小（8字节） |
| **传输效率** | 较低（因确认机制等） | 高（轻量、快速） |
| **流量控制/拥塞控制** | 有 | 无 |
| **适用场景** | 要求高可靠性的应用 | 要求低延迟、容忍丢包的应用 |


---

### 典型应用场景
#### ✅ TCP 常用于：
+ **网页浏览（HTTP/HTTPS）**：确保网页内容完整加载。
+ **文件传输（FTP、SFTP）**：不能丢失任何数据。
+ **电子邮件（SMTP、POP3、IMAP）**：需保证邮件内容准确无误。
+ **数据库通信**：对数据一致性要求高。
+ **远程登录（SSH、Telnet）**：命令与响应必须准确。

#### ✅ UDP 常用于：
+ **实时音视频通话（如 Zoom、Skype、VoIP）**：允许少量丢包，但不能容忍延迟。
+ **在线游戏**：位置更新频繁，旧数据过时后无需重传。
+ **DNS 查询**：请求/响应简短，速度快更重要。
+ **流媒体（如直播）**：可接受部分画质损失，但需流畅播放。
+ **物联网（IoT）传感器数据上报**：数据量小、频率高、可容忍偶尔丢失。

# CORS 响应头速查表
| 响应头 | 用途 | 是否必需 |
| :---: | :---: | :---: |
| `Access-Control-Allow-Origin` | 允许哪些源访问 | ✅ 必需 |
| `Access-Control-Allow-Credentials` | 是否允许带凭证 | 按需 |
| `Access-Control-Allow-Methods` | 允许的 HTTP 方法 | 非简单请求必需 |
| `Access-Control-Allow-Headers` | 允许的请求头 | 非简单请求必需 |
| `Access-Control-Expose-Headers` | 允许读取的响应头 | 按需 |
| `Access-Control-Max-Age` | 预检结果缓存时间 | 可选 |


# 协商缓存与强制缓存
#### 概念
1.强缓存：不会向服务器发送请求，直接从缓存中读取资源，在chrome控制台的network选项中可以看到该请求返回200的状态码;

2.协商缓存：向服务器发送请求，服务器会根据这个请求的request header的一些参数来判断是否命中协商缓存，如果命中，则返回304状态码并带上新的response header通知浏览器从缓存中读取资源；

两者的共同点是，都是从客户端缓存中读取资源；区别是强缓存不会发请求，协商缓存会发请求。

#### 浏览器缓存过程：
+ 下一次加载资源时，由于强制缓存优先级较高，先比较当前时间与上一次返回 200 时的时间差，如果没有超过 cache-control 设置的 max-age，则没有过期，并命中强缓存，直接从本地读取资源。如果浏览器不支持HTTP1.1，则使用 expires 头判断是否过期；
+ 如果资源已过期，则表明强制缓存没有被命中，则开始协商缓存，向服务器发送带有 If-None-Match 和 If-Modified-Since 的请求；
+ 服务器收到请求后，优先根据 Etag 的值判断被请求的文件有没有做修改，Etag 值一致则没有修改，命中协商缓存，返回 304；如果不一致则有改动，直接返回新的资源文件带上新的 Etag 值并返回 200；
+ 如果服务器收到的请求没有 Etag 值，则将 If-Modified-Since 和被请求文件的最后修改时间做比对，一致则命中协商缓存，返回 304；不一致则返回新的 last-modified 和文件并返回 200；
+ 很多网站的资源后面都加了版本号，这样做的目的是：每次升级了 JS 或 CSS 文件后，为了防止浏览器进行缓存，强制改变版本号，客户端浏览器就会重新下载新的 JS 或 CSS 文件 ，以保证用户能够及时获得网站的最新更新。

# 前端缓存中，哪些资源一般不会被缓存在客户端
## HTML文件（入口文件）
HTML文件是前端应用的核心入口文件，通常不应该设置强缓存。因为HTML文件包含了其他静态资源的引用，如果HTML被缓存，即使其他资源更新了，用户仍然会看到旧的页面结构

# 静态资源加载失败时如何优雅处理
| 资源类型 | 处理方式 | |
| :---: | --- | --- |
| 图片 | 1. 占位图、alt 属性<br/>2. 重试机制 <br/>3. 上报服务器分析<br/><imgid="myImage"src="path/to/non-existent-image.jpg"alt="An image"onerror="handleImageError()"> | |
| css 资源 | 1. 内联样式编写关键样式<br/>2. 启用备用样式<br/>3. 上报服务器分析<br/><linkid="myStylesheet"rel="stylesheet"href="path/to/a.css"onerror="handleLinkError()"><br/>functionhandleLinkError() {<br/> _// 当样式表加载失败时，将样式表的href更改为备用样式表_<br/>document.getElementById('myStylesheet').href = 'path/to/b.css'; <br/>} | |
| js 文件处理 | 1. 内联脚本<br/>2. 替换备用脚本<br/>3. 上报服务器分析<br/><scriptsrc="path/to/non-existent-script.js"onerror="handleScriptError()"></script> <br/>functionhandleScriptError() {<br/> _// 当JavaScript文件加载失败时，加载备用脚本_<br/>const backupScript = document.createElement('script'); <br/>backupScript.src = 'path/to/backup-script.js'; <br/>document.head.appendChild(backupScript); <br/>} | |
| CDN 错误 | 1. 本地备份<br/>2. 动态切换 | |
| 字体 | 1. 使用降级字体（font-family 多写几个值）<br/>2. webfont 处理字体问题 | |
| SSR 加载 | 1. 降级的 html 用作渲染<br/>2. 切换为 CSR | |


# html 页面加载失败时候重试
```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <title>资源加载失败自动重试方案</title>
    <script>
      // 资源类型对应的备用域名映射表
      const retryConfig = {
        js: {
          // 脚本资源备用域名池
          domains: [
            'cdn1.example.com',
            'cdn2.example.com',
            'cdn3.example.com'
          ],
          // 最大重试次数
          maxRetries: 3
        },
        css: {
          domains: [
            'static1.example.com',
            'static2.example.com'
          ],
          maxRetries: 2
        },
        img: {
          domains: [
            'img1.example.com',
            'img2.example.com'
          ],
          maxRetries: 2,
          // 终极备用图片
          fallback: 'data:image/svg+xml;base64,P'
        }
      };

      // 资源重试记录器
      const retryRecords = {};

      // 全局错误监听（捕获阶段）
      window.addEventListener('error', function(event) {
        // 过滤非资源加载错误
        if (event instanceof ErrorEvent || !event.target) return;

        const target = event.target;
        const tagName = target.tagName;

        // 仅处理脚本、样式、图片资源
        if (!['SCRIPT', 'LINK', 'IMG'].includes(tagName)) return;

        const resourceType = 
          tagName === 'SCRIPT' ? 'js' : 
          tagName === 'LINK' ? 'css' : 'img';

        const originalUrl = target.src || target.href;
        if (!originalUrl) return;

        // 初始化重试记录
        if (!retryRecords[originalUrl]) {
          retryRecords[originalUrl] = {
            retryCount: 0,
            type: resourceType
          };
        }

        const record = retryRecords[originalUrl];
        const config = retryConfig[resourceType];

        // 检查是否达到最大重试次数
        if (record.retryCount >= config.maxRetries) {
          handleFinalFailure(target, config);
          return;
        }

        // 执行重试操作
        retryResource(target, record, config);
      }, true); // 捕获阶段监听 

      // 资源重试核心方法
      function retryResource(element, record, config) {
        const originalUrl = element.src || element.href;
        const urlObj = new URL(originalUrl);

        // 获取当前重试的备用域名 
        const domain = config.domains[record.retryCount % config.domains.length];
        urlObj.host = domain;

            const newUrl = urlObj.toString();
            
            // 根据资源类型选择重试策略 
            switch (record.type) {
                case 'js':
                    retryJavaScript(element, newUrl);
                    break;
                    
                case 'css':
                    retryCSS(element, newUrl);
                    break;
                    
                case 'img':
                    retryImage(element, newUrl);
                    break;
            }
            
            // 更新重试计数
            record.retryCount++;
        }

        // JS重试方案（阻塞式写入）
        function retryJavaScript(oldElement, newUrl) {
            // 创建新的script标签（阻塞解析）
            const scriptContent = `document.write('<script src="${newUrl}"><\\/script>');`;
            const script = document.createElement('script');
            script.textContent = scriptContent;
            
            // 插入到原位置之前
            oldElement.parentNode.insertBefore(script, oldElement);
            
            // 移除旧元素
            oldElement.remove();
        }

        // CSS重试方案
        function retryCSS(oldElement, newUrl) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = newUrl;
            
            // 保留原有属性
            if (oldElement.media) link.media = oldElement.media;
            
            // 插入到head末尾
            document.head.appendChild(link);
            
            // 移除旧元素
            oldElement.remove();
        }

        // 图片重试方案
        function retryImage(oldElement, newUrl) {
            // 设置新的src（浏览器会自动尝试加载）
            oldElement.src = newUrl;
        }

        // 最终失败处理
        function handleFinalFailure(element, config) {
            if (element.tagName === 'IMG' && config.fallback) {
                // 图片使用备用图片 
                element.src = config.fallback;
            } else if (element.tagName === 'SCRIPT') {
                // 脚本加载最终失败通知
                console.error(`脚本加载失败: ${element.src}`);
            }
        }
    </script>
    
    <!-- 示例资源（实际使用时替换为真实资源） -->
    <link rel="stylesheet" href="https://unreliable-domain.com/styles.css">
    <script src="https://unreliable-domain.com/app.js"></script>
</head>
<body>
    <img src="https://unreliable-domain.com/logo.png" alt="Company Logo">
    
    <h2>资源加载失败重试机制说明</h2>
    <p>此页面实现了完整的资源加载失败自动重试机制：</p>
    <ol>
        <li><strong>智能监听</strong>：在页面头部捕获所有资源加载错误 </li>
        <li><strong>分类处理</strong>：分别处理JS/CSS/IMG资源 </li>
        <li><strong>多级备用</strong>：为每种资源配置备用域名池 </li>
        <li><strong>阻塞重试</strong>：JS资源使用document.write保证执行顺序 </li>
        <li><strong>终极备用</strong>：图片加载完全失败时显示备用图 </li>
    </ol>
</body>
</html>
```

# js脚本缓存defer 和 async区别
#### defer 和 async是什么：
+ async:
    - 当 async 属性被设置时，浏览器会异步加载脚本，并且不保证脚本的执行顺序与它们在文档中的出现顺序一致。
    - 脚本一旦可用就会被执行，无论它是否在文档解析完成之后。这意味着如果多个带有 async 的脚本同时加载，它们可能以任意顺序完成，这取决于哪个脚本先下载完成。
    - 由于 async 脚本不会阻塞页面渲染，通常建议用于那些不是严格依赖于页面其他部分初始化完成才能执行的独立功能脚本。
+ defer:
    - 当 defer 属性被设置时，浏览器也会异步加载脚本，但与 async 不同的是，它会确保脚本按照在文档中出现的顺序执行，且总是在DOMContentLoaded事件触发之前执行，即在文档解析完成后，但在所有CSSOM计算和渲染之前。
    - 多个带有 defer 属性的脚本会按照它们在文档中定义的顺序执行，这对于那些需要遵循特定执行顺序的脚本来说非常有用。

#### 总结：
+ async: 异步加载，执行顺序不确定，不阻塞DOM构建，一旦下载完成立即执行。
+ defer: 也异步加载，但保证执行顺序与脚本在文档中的顺序一致，同样不阻塞DOM构建，但在DOMContentLoaded事件之前按序执行。

# 当 QPS 达到峰值如何处理
```javascript
1、请求限流：
// nodejs为例：
const express = require('express');
const { RateLimiterMemory } = require('rate-limiter-flexible');

const app = express();

// 创建一个内存中的限流器
const rateLimiter = new RateLimiterMemory({
  points: 5, // 每个时间窗口内允许的请求数
  duration: 1, // 时间窗口的持续时间，以秒为单位
});

// 中间件：检查请求速率
app.use((req, res, next) => {
  rateLimiter.consume(req.ip)
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).send('Too Many Requests');
    });
});

2、请求合并：函数防抖、函数截流

3、请求缓存：swr里面针对请求的内容缓存（npm install swr）
import React from 'react';
import useSWR from 'swr';

// 定义一个简单的fetcher函数，用于从API获取数据
const fetcher = (url) => fetch(url).then((res) => res.json());

function App() {
  // 使用useSWR钩子获取数据
  const { data, error } = useSWR('https://api.example.com/data', fetcher);

  // 显示数据 
  return (
    <div>
      <h1>Data:</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
export default App;

4、任务队列：设计任务队列
```

# REACT FIBER架构是如何解决同步渲染导致的卡顿问题
React Fiber 架构是 React 16 引入的核心重构，它彻底改变了 React 的协调（Reconciliation）算法，主要就是为了解决旧架构中**同步、不可中断的渲染**导致的主线程阻塞和页面卡顿问题。

简单来说，Fiber 通过**任务分解（Time Slicing）**、**优先级调度（Priority Scheduling）****和****双缓冲机制（Double Buffering）**，让 React 从一个“固执的独裁者”变成了一个“灵活的协作者”。

以下是 Fiber 解决卡顿问题的具体原理：

### 🪚 1. 核心变革：从“递归”到“链表” (任务分解)
在 React 15 及以前，渲染是一个同步的递归过程。一旦开始，就必须遍历完整棵树才能停下来，期间会完全霸占主线程。

Fiber 将虚拟 DOM 树重构为**Fiber 树**，其节点之间通过链表指针连接（`return`、`child`、`sibling`）。这种数据结构的改变，使得 React 能够将整个渲染任务拆解成一个个微小的**工作单元（Unit of Work）**。

+ **旧架构（同步渲染）：** 像一口气跑完马拉松，中间不喝水不休息，观众（用户）只能干等你跑完才能互动。
+ **Fiber 架构（可中断渲染）：** 像吃自助餐，吃一口看一眼周围。React 每处理完一个 Fiber 节点（一个工作单元），就会检查一下浏览器的主线程是否还有空闲时间。

### 🚦 2. 协作式调度：让出主线程 (解决卡顿的关键)
这是解决卡顿最直接的手段。Fiber 引入了**协作式调度（Cooperative Scheduling）**机制：

+ **利用**** **`**requestIdleCallback**`** ****/ Scheduler：** React 不再独占主线程，而是利用浏览器的空闲时间来执行渲染任务。
+ **随时中断与恢复：** 如果在执行渲染任务时，用户触发了高优先级的操作（如点击按钮、输入文字、动画帧），Fiber 会立即**中断**当前的渲染，将控制权交还给浏览器去处理用户交互。
+ **断点续传：** 等高优先级任务处理完，React 会从刚才中断的地方继续恢复渲染。

这种机制保证了**用户交互永远优先于渲染更新**，从而避免了输入卡顿或动画掉帧。

### 🚧 3. 优先级车道 (Lanes)：区分任务紧急程度
Fiber 引入了复杂的优先级模型（Lanes 模型），将不同类型的更新赋予不同的优先级：

+ **高优先级（同步/用户交互）：** 如用户的点击、键盘输入。这些任务必须立即响应，不可中断。
+ **低优先级（可中断/过渡更新）：** 如服务端数据获取后的界面更新、非阻塞的视觉效果。

**效果：** 当一个低优先级的长列表渲染正在进行时，如果突然来了一个高优先级的按钮点击事件，Fiber 会让低优先级任务“插队”或暂停，先处理点击事件，处理完再回来继续渲染列表。

### ⚖️ 4. 双缓冲机制：构建“草稿”树
Fiber 在内存中维护了两棵树：

+ `**current**`** ****树：** 当前屏幕上显示的树。
+ `**workInProgress**`** ****(WIP) 树：** 正在内存中构建的“草稿”树。

**工作流程：**

1. 所有的 diff 计算、组件渲染、副作用标记都在 **WIP 树**上进行。这个过程是可以被打断和丢弃的。
2. 只有当整棵 WIP 树完全构建并校验完毕后，React 才会进入 **Commit 阶段**（这个阶段不可中断）。
3. 在 Commit 阶段，React 会将 WIP 树一次性“切换”成 current 树，并批量更新真实 DOM。

这种机制保证了用户永远看不到“半成品”的界面，同时也让渲染过程具备了“回滚”的能力。

### 📊 两个阶段的渲染流程
Fiber 将渲染过程明确分为两个阶段，只有第一个阶段是可中断的：

| 阶段名称 | 是否可中断 | 主要工作 | 作用 |
| :--- | :--- | :--- | :--- |
| **Render 阶段** | ✅ **是** | 构建 WIP 树、diff 对比、打副作用标签 | 计算“需要做什么”，可以随时暂停去响应用户点击 |
| **Commit 阶段** | ❌ **否** | 操作真实 DOM、触发生命周期、执行副作用 | 执行“最终动作”，必须一口气完成以保证一致性 |


### 📌 总结
React Fiber 通过将渲染任务拆解为**链表节点**，利用**浏览器空闲时间**进行**可中断**的遍历，并结合**优先级调度**，确保高优任务（用户交互）永远能插队执行。最后通过**双缓冲**机制，在内存中构建好完整视图后再一次性提交。

这一整套机制，从根本上解决了旧版 React 因长时间占用主线程而导致的**页面卡死**问题，为 React 18 的并发渲染（Concurrent Rendering）、`Suspense`、`useTransition` 等高级特性奠定了基础。

# react18 如何实现并发更新
React 18 的并发更新（Concurrent Updates）并非指多线程并行处理，而是通过可中断的渲染机制实现更高效的调度，其核心在于时间切片（Time Slicing）、优先级调度（Lane Model）和可中断渲染（Interruptible Rendering）。以下是具体实现方式：

---

### 一、核心机制
1. **时间切片（Time Slicing）** 
将渲染任务拆分为多个小片段，在浏览器空闲时段执行，避免长时间阻塞主线程。当高优先级事件（如用户输入）触发时，React 可中断当前渲染，优先处理紧急任务。
2. **优先级调度（Lane Model）** 
为不同更新分配优先级（如用户交互 > 数据请求），确保关键操作不被阻塞。例如：
    - **紧急更新**：用户输入、点击事件（高优先级）。
    - **过渡更新**：搜索结果渲染、数据加载（低优先级）。
3. **可中断渲染（Interruptible Rendering）** 
基于 Fiber 架构的双缓冲机制，构建 `Current Tree`（当前树）和 `WorkInProgress Tree`（工作树）。渲染过程中可暂停、恢复或丢弃低优先级任务，完成后一次性提交到 DOM，保证视图一致性。

---

### 二、关键 API 实现
#### 1. `startTransition`：标记非紧急更新
将状态更新标记为低优先级，允许高优先级任务中断：

```javascript
import { startTransition } from 'react';
function SearchBox() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState([]);
const handleChange = (e) => {
    const value = e.target.value;
    setInput(value); // 紧急更新：立即响应输入
    startTransition(() => {
      // 过渡更新：可被中断的搜索请求
      fetchResults(value).then(data => setResults(data));
    });
  };
  return <input value={input} onChange={handleChange} />;
}
```

**效果**：输入框实时响应，搜索结果延迟渲染，避免卡顿。

#### 2. `useDeferredValue`：延迟值更新
返回一个延迟更新的值，用于优化高频状态更新：

```javascript
import { useDeferredValue } from 'react';
function App() {
  const [text, setText] = useState('');
  const deferredText = useDeferredValue(text); // 延迟获取稳定值
return (
    <>
      <input value={text} onChange={e => setText(e.target.value)} />
      <HeavyComponent text={deferredText} /> {/* 使用延迟值避免卡顿 */}
    </>
  );
}
```

**原理**：当 `text` 快速变化时，`deferredText` 会滞后更新，减少昂贵计算的触发频率。

#### 3. `useTransition`：控制过渡状态
提供 `isPending` 状态，用于显示加载反馈：

```javascript
import { useTransition } from 'react';
function TabSwitcher() {
  const [tab, setTab] = useState('home');
  const [isPending, startTransition] = useTransition();
const selectTab = (nextTab) => {
    startTransition(() => setTab(nextTab)); // 延迟切换标签
  };
return (
    <>
      {isPending && <Spinner />} {/* 显示过渡状态 */}
      <Tabs active={tab} onSelect={selectTab} />
    </>
  );
}
```

---

### 三、并发渲染的底层支持
1. **Fiber 架构双缓冲** 
通过 `Current Tree` 和 `WorkInProgress Tree` 实现可中断渲染。渲染时逐步构建工作树，高优先级任务可中断当前进度，完成后原子性切换树结构。
2. **自动批处理（Automatic Batching）** 
React 18 默认合并所有状态更新（包括异步操作），减少渲染次数：

```javascript
setTimeout(() => {
  setCount(c => c + 1); // 合并更新
  setFlag(f => !f);     // 仅触发一次重渲染
}, 1000);
```

3. **Suspense 集成** 
结合 `Suspense` 实现组件级代码分割与异步加载：

```javascript
const LazyComponent = lazy(() => import('./HeavyComponent'));
function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazyComponent />
    </Suspense>
  );
}
```

**优势**：并发渲染中可中断并复用已有结果，避免重复加载。

---

### 四、迁移与性能优化
1. **启用并发模式** 
使用 `createRoot` 替代旧版 `ReactDOM.render`：

```javascript
import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

2. **性能监控** 
通过 React DevTools 的 "Timeline" 面板观察渲染中断与优先级调度。
3. **避免过度使用** 
仅对非紧急更新使用过渡标记（如数据加载、复杂渲染），用户直接交互需保持高优先级。

---

### 五、并发更新的价值
+ **用户体验**：解决界面卡顿，提升大型应用响应能力。
+ **开发灵活性**：通过 `startTransition` 和 `useDeferredValue` 精细化控制更新优先级。
+ **渐进式迁移**：无需重写代码，逐步采用并发特性。 
通过上述机制，React 18 在单线程环境下模拟了“并发”效果，使应用在高负载场景下仍保持流畅交互。

# 前端一些数学计算库如何解决计算精度问题
这些数学计算库解决精度问题的核心思路非常直接：**绕开 JavaScript 原生的 **`Number`** 类型**。 
它们通过提供 `BigDecimal` 这样的新数据类型，将数字以**字符串**或**整数**的形式存储和运算，从而彻底避开浮点数的二进制表示误差。

---

### 一、精度问题根源
JavaScript 使用 **IEEE 754** 双精度浮点数标准，导致：

+ **舍入误差**：`0.1 + 0.2 = 0.30000000000000004`
+ **大数精度丢失**：`9999999999999999` 被表示为 `10000000000000000`
+ **累加偏差**：循环累加 `0.1` 10 次可能不等于 `1.0`

---

### 二、核心解决方案
#### 1. 高精度库（推荐）
通过自定义数据类型替代原生 `Number`，实现任意精度计算：

| **库名称** | **特点** | **适用场景** |
| --- | --- | --- |
| `decimal.js` | 支持 ±10^±1e9 精度，链式调用 | 金融计算、科学运算 |
| `big.js` | 轻量级（仅 3KB），API 简洁 | 移动端、简单场景 |
| `math.js` | 支持矩阵、复数等高级数学运算 | 工程计算、数据分析 |
| **实现原理**： | | |


+ 将数字拆分为 **符号 + 系数 + 指数** 三部分存储
+ 所有运算转换为整数运算后重组结果
+ 示例（decimal.js）：

```javascript
import Decimal from 'decimal.js';
const a = new Decimal('0.1'); // 避免原生Number解析误差
const b = new Decimal('0.2');
console.log(a.plus(b).toString()); // '0.3'
```

#### 2. 整数换算
将小数放大为整数运算后还原：

```javascript
function addDecimals(a, b) {
  const factor = 10 ** Math.max(
    (a.toString().split('.') || '').length,
    (b.toString().split('.') || '').length
  );
  return (a * factor + b * factor) / factor;
}
addDecimals(0.1, 0.2); // 0.3
```

**局限**：易溢出，不适用于复杂数学函数（如三角函数）。

#### 3. 原生方法补救
+ `toFixed()`** + **`parseFloat`：

```javascript
parseFloat((0.1 + 0.2).toFixed(10)); // 0.3
```

风险：四舍五入可能引入新误差。

+ `Number.EPSILON`** 容差比较**：

```javascript
Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON; // tr
```

---

# 如果requestiAnimationFrame执行一个非常耗时的同步任务，会发生什么
    如果在 `requestAnimationFrame`（简称 `rAF`）的回调中执行一个非常耗时的同步任务，最直接的后果就是**动画会卡住甚至整个页面失去响应**。这背后的根本原因，是它会完全阻塞浏览器的主线程，从而破坏了浏览器赖以实现流畅体验的渲染机制。具体来说，这会引发以下连锁反应：

---

### ⚠️ 核心问题：主线程阻塞与帧率崩溃
1. **帧率暴跌与掉帧** 
浏览器通常以 **60FPS** 的频率渲染画面（每帧约 **16.6ms**）。若 `rAF` 回调中的同步任务执行时间超过此间隔，后续帧的渲染将被推迟，导致帧率下降。例如，一个耗时 100ms 的任务会直接导致连续 6 帧丢失（100ms ÷ 16.6ms ≈ 6），动画出现明显卡顿。
2. **主线程锁死** 
JavaScript 与渲染引擎共享主线程。耗时同步任务会完全阻塞线程，导致：
    - 用户交互事件（如点击、滚动）无法响应
    - 其他 `rAF` 或 `setTimeout` 回调被延迟执行
    - 页面渲染冻结，甚至触发浏览器的“页面无响应”警告

---

### 🔍 深层影响：渲染流水线中断
浏览器的渲染流程包含 **样式计算 → 布局 → 绘制 → 合成** 多个阶段。耗时任务会打断这一流水线：

1. **布局抖动（Layout Thrashing）** 
若任务中频繁读写 DOM 属性（如 `offsetTop`、`getComputedStyle`），会强制浏览器反复触发重排（Reflow），极大增加性能开销。
2. **合成器线程孤立** 
即使 `rAF` 本应与合成器线程协同优化动画（如 CSS Transform），但主线程阻塞会使合成器无法获取最新状态，导致动画中断。

---

### 📊 性能对比：正常 vs 耗时任务
| **指标** | **正常 rAF（≤16ms）** | **耗时任务（>100ms）** |
| --- | --- | --- |
| 帧率 | 60FPS（流畅） | ≤10FPS（严重卡顿） |
| 用户交互响应 | 即时 | 延迟至任务结束 |
| 内存占用 | 稳定 | 可能因重排/重绘激增 |
| 浏览器渲染优化 | 有效启用 | 完全失效 |


---

### 💡 优化方案：避免同步阻塞
1. **任务分割（Chunking）** 
将大任务拆分为小块，通过 `setTimeout` 或 `queueMicrotask` 分批执行，释放主线程：

```javascript
function processChunk(data, start, end) {
  // 处理部分数据
  if (end < data.length) {
    setTimeout(() => processChunk(data, end, end + chunkSize), 0);
  }
}
```

2. **Web Worker 处理密集计算** 
将耗时计算移至 Worker 线程，避免阻塞主线程：

```javascript
const worker = new Worker('heavyTask.js');
worker.postMessage(data); // 发送数据到 Worker
worker.onmessage = (e) => updateDOM(e.data); // 结果返回后更新 DOM
```

3. **使用 **`requestIdleCallback` 
对非关键任务（如日志上报），利用空闲时段执行：

```javascript
requestIdleCallback(() => {
  // 浏览器空闲时执行低优先级任务
});
```

---

### ⚡ 关键总结
+ **核心原则**：`rAF` 仅用于 **动画相关的 DOM 更新**，且需确保执行时间 ≤ 16ms。
+ **风险提示**：耗时同步任务不仅卡顿动画，还可能引发页面崩溃，尤其在低端设备上。
+ **替代方案**：计算密集型任务优先使用 **Web Worker**，非关键任务改用 `rIC` 或 **分片执行**。 
通过合理拆分任务与多线程协作，可兼顾动画流畅性与复杂逻辑的执行效率。

# Web前端开发中，File和Blob对象对比
| **特性** | **Blob** | **File** |
| :---: | :---: | :---: |
| **继承关系** | 基础二进制对象 | 继承自Blob的子类 |
| **元数据** | 仅含`size`（大小）、`type`（MIME类型） | 额外包含`name`（文件名）、`lastModified`（修改时间） |
| **创建方式** | `new Blob([data], options)` | 用户通过`<input type="file">`选择或`new File([data], name, options)` |
| **适用场景** | 通用二进制数据（如图片流、动态生成内容） | 用户系统文件（如上传、预览） |
| **传输兼容性** | 可直接通过`fetch`、`XMLHttpRequest`发送 | 需通过`FormData`包装后发送 |


# 搜索框防抖优化
```javascript
let controller = null;

function search(keyword) {
  if (controller) controller.abort(); // 取消前序请求
  controller = new AbortController();
  
  fetch(`/api/search?q=${keyword}`, {
    signal: controller.signal
  })
    .then(response => response.json())
    .then(data => updateUI(data));
}
```

# js 代码动态执行
```javascript
1. ​eval()函数
  eval("console.log('动态执行成功')"); 
2. ​Function构造函数
  const dynamicFunc = new Function('a', 'b', 'return a + b');
  console.log(dynamicFunc(3,5)); // 输出8  
```

```javascript
1. ​script标签注入
  function loadScript(code) {
    const script = document.createElement('script');
    script.textContent = code;
    document.head.appendChild(script); 
}
2. ​模块化动态导入
  import('./module.js').then(module => module.run());
```

```javascript
1. ​沙箱化执行环境
  const worker = new Worker(URL.createObjectURL(new Blob([code])));
```

```javascript
1. ​ssetTimeout函数(作用域为全局)
  setTimeout("console.log('动态执行成功')",0)
```

# js 动画卡顿怎么优化处理
## 一、核心原则：**让动画运行在合成线程（Compositor Thread）**
现代浏览器有多个线程：

+ **主线程（Main Thread）**：执行 JS、样式计算、布局（Layout）、绘制（Paint）
+ **合成线程（Compositor Thread）**：只负责将图层（Layer）合并并显示，**不阻塞主线程**

✅ **目标**：让动画**只触发合成（Composite）**，不触发 Layout / Paint。

---

## 二、关键优化手段
### ✅ 1. **使用**** **`**transform**`** ****和**** **`**opacity**`** ****实现动画**
这两个属性可以**完全由 GPU 加速**，且不会触发重排/重绘。

```css
/* ✅ 推荐：GPU 加速，仅合成 */
.element {
  transform: translateX(100px); /* 位移 */
  opacity: 0.5;                /* 透明度 */
}

/* ❌ 避免：触发重排 */
.element {
  left: 100px;    /* 改变几何属性 → 重排 */
  width: 200px;
}
```

💡 原理：`transform` 和 `opacity` 可以提升为**独立合成层（Compositing Layer）**，由 GPU 处理。

---

### ✅ 2. **主动提升元素为合成层（Promote to Layer）**
通过以下 CSS 属性强制创建新图层：

```css
.promoted {
  will-change: transform;        /* 推荐：明确告知浏览器 */
  /* 或 */
  transform: translateZ(0);      /* hack 方式（慎用） */
  /* 或 */
  backface-visibility: hidden;   /* 常用于 3D 动画 */
}
```

⚠️ 注意：**不要滥用**！每个图层都占用显存，过多会导致内存爆炸。

---

### ✅ 3. **使用**** **`**requestAnimationFrame**`**（rAF）驱动动画**
替代 `setTimeout` / `setInterval`，确保动画与屏幕刷新同步：

```javascript
function animate() {
  // 更新 transform / opacity
  element.style.transform = `translateX(${x}px)`;

  if (x < target) {
    x += speed;
    requestAnimationFrame(animate); // 下一帧继续
  }
}

requestAnimationFrame(animate);
```

✅ 优势：

+ 自动匹配屏幕刷新率（60Hz / 120Hz）
+ 页面隐藏时自动暂停，省电

---

### ✅ 4. **避免在动画中读取布局属性（Layout Thrashing）**
**禁止在动画循环中读取会触发回流的属性**：

```javascript
// ❌ 卡顿！每次 offsetWidth 都强制同步计算布局
for (let i = 0; i < 100; i++) {
  element.style.left = element.offsetWidth + 10 + 'px'; // 读 + 写 = 强制 reflow
}
```

✅ 正确做法：

+ **提前缓存布局值**
+ **使用**** **`**getBoundingClientRect()**`** ****一次性读取**

```javascript
const width = element.offsetWidth; // 提前读一次
for (let i = 0; i < 100; i++) {
  element.style.transform = `translateX(${width + 10 * i}px)`; // 只写 transform
}
```

---

### ✅ 5. **使用 CSS 动画或 Web Animations API（优先级更高）**
如果逻辑简单，**优先用纯 CSS**：

```css
@keyframes slide {
  from { transform: translateX(0); }
  to   { transform: translateX(100px); }
}
.element { animation: slide 0.5s ease; }
```

或使用 **Web Animations API**（JS 控制 + 性能好）：

```javascript
element.animate([
  { transform: 'translateX(0)' },
  { transform: 'translateX(100px)' }
], { duration: 500, easing: 'ease' });
```

✅ 优势：浏览器可深度优化，甚至在**非主线程**运行。

---

### ✅ 6. **减少动画元素的复杂度**
+ 避免对**大区域**或**复杂子树**做动画。
+ 对**小元素**（如按钮、图标）动画更流畅。
+ 使用 `contain: layout style paint` 限制重排/重绘范围（CSS Containment）：

```css
.animated-element {
  contain: layout style paint;
}
```

---

### ✅ 7. **使用性能分析工具定位瓶颈**
+ **Chrome DevTools → Performance 面板**：
    - 录制动画过程
    - 查看 **Frames** 是否有 >16ms 的长任务
    - 检查是否出现 **Layout / Recalculate Style**（红色三角警告）
+ **Layers 面板**：确认动画元素是否被提升为独立图层。

# 对象数组去重
```javascript
const result = [];

const isObject = (val) => typeof val === 'object' && val !== null;

function equal(val1, val2) {
  if (!isObject(val1) || !isObject(val2)) {
    return val1 === val2;
  }
  const keys1 = Object.keys(val1);
  const keys2 = Object.keys(val2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (const key of keys1) {
    if (!keys2.includes(key) || !equal(val1[key], val2[key])) {
      return false;
    }
  }
  return true;
}

for (const item of arr) {
  let isFind = false;
  for (const r of result) {
    if (equal(item,r)) {
      isFind = true;
      break;
    }
  }
  if (!isFind) {
    result.push(item);
  }
}
```

# 页面关闭时执行方法
```javascript
​**beforeunload**​：在页面关闭/刷新前触发，可阻止默认行为
window.addEventListener('beforeunload', (event) => {
  event.preventDefault();  // 必须设置返回值
  event.returnValue = '';  // 触发浏览器默认提示框
  navigator.sendBeacon('/api/log', data); // 发送请求
});
**unload**​：页面完全卸载后触发，但现代浏览器可能限制其执行时间
```

# 退出浏览器之前发送积压的埋点数据
```javascript
window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    const data = new Blob([JSON.stringify(unsentData)], {type: 'application/json'});
    navigator.sendBeacon('/api/log', data); // 异步发送数据
  }
});
```

```javascript
window.addEventListener('beforeunload', () => {
  fetch('/api/log', {
    method: 'POST',
    body: JSON.stringify(unsentData),
    keepalive: true // 允许请求在页面关闭后继续
  });
});
```

# 使用问询模式实现交通灯问题
```javascript
class TrafficLight {
  constructor(lights) {
    this._lights = lights;
    this._currentIndex = 0; // 当前状态索引
    this.switchTime = Date.now(); // 状态切换时间
  }

  _update() {
    while (1) {
      if (this._disTime < this._current.lasts) {
        break;
      }
      this.switchTime += this._current.lasts;
      this._currentIndex = (this._currentIndex + 1) % this._lights.length;
    }
  }

  get _current() {
    return this._lights[this._currentIndex];
  }

  get _disTime() {
    return Date.now() - this.switchTime;
  }

  getCurrentLight() {
    this._update();
    return {
      color: this._current.color,
      remain: this._current.lasts - this._disTime,
    };
  }
}

const light = new TrafficLight([
  { color: "red", lasts: 3000 },
  { color: "yellow", lasts: 1000 },
  { color: "green", lasts: 2000 },
]);

function render() {
  requestAnimationFrame(render);
  const current = light.getCurrentLight();
  console.log(`当前颜色是 ${current.color}，还剩 ${current.remain} 毫秒`);
}
render();

```

# 实现观察者模式
```javascript
定义对象间的一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都将得到通知
// 被观察者 学生
class Subject {
  constructor() {
    this.state = "happy";
    this.observers = []; // 存储所有的观察者
  }
  //新增观察者
  add(o) {
    this.observers.push(o);
  }
  //获取状态
  getState() {
    return this.state;
  }
  // 更新状态并通知
  setState(newState) {
    this.state = newState;
    this.notify();
  }
  //通知所有的观察者
  notify() {
    this.observers.forEach((o) => o.update(this));
  }
}
 
// 观察者 父母和老师
class Observer {
  constructor(name) {
    this.name = name;
  }
  //更新
  update(student) {
    console.log(`亲爱的${this.name} 通知您当前学生的状态是${student.getState()}`);
  }
}
 
let student = new Subject();
let parent = new Observer("父母");
let teacher = new Observer("老师");
//添加观察者
student.add(parent);
student.add(teacher);
//设置被观察者的状态
student.setState("刚刚好");
```

# 实现发布-订阅模式
```javascript
发布订阅模式跟观察者模式很像，但它发布和订阅是不互相依赖的，因为有一个统一调度中心
class EventBus {
  constructor() {
    // 缓存列表，用来存放注册的事件与回调
    this.cache = {};
  }
 
  // 订阅事件
  on(name, cb) {
    // 如果当前事件没有订阅过，就给事件创建一个队列
    if (!this.cache[name]) {
      this.cache[name] = []; //由于一个事件可能注册多个回调函数，所以使用数组来存储事件队列
    }
    this.cache[name].push(cb); 
  }
 
  // 触发事件
  emit(name, ...args) {
    // 检查目标事件是否有监听函数队列
    if (this.cache[name]) {
      // 逐个调用队列里的回调函数
      this.cache[name].forEach((callback) => {
        callback(...args);
      });
    }
  }
 
  // 取消订阅
  off(name, cb) {
    const callbacks = this.cache[name]; 
    const index = callbacks.indexOf(cb); 
    if (index !== -1) {
      callbacks.splice(index, 1); 
    }
  }
 
  // 只订阅一次
  once(name, cb) {
    // 执行完第一次回调函数后，自动删除当前订阅事件
    const fn = (...args) => {
      cb(...args); 
      this.off(name, fn); 
    };
    this.on(name, fn);
  }
}
 
// 测试
let eventBus = new EventBus();
let event1 = function (...args) {
  console.log(`通知1-订阅者小陈老师,小明同学当前心情状态：${args}`)
};
// 订阅事件，只订阅一次
eventBus.once("teacherName1", event1);
// 发布事件
eventBus.emit("teacherName1", "教室", "上课", "打架", "愤怒");
eventBus.emit("teacherName1", "教室", "上课", "打架", "愤怒");
eventBus.emit("teacherName1", "教室", "上课", "打架", "愤怒");
```

# 观察者模式和发布订阅模式有什么区别
观察者模式（Observer Pattern）和发布-订阅模式（Publish-Subscribe Pattern，简称 Pub/Sub）在概念上非常相似，都是用于实现对象间的一对多依赖关系，当一个对象状态发生变化时，所有依赖它的对象都会收到通知并自动更新。但它们在**结构、耦合度、使用场景**等方面存在关键区别。

---

### 一、核心思想对比
| 特性 | 观察者模式 | 发布-订阅模式 |
| --- | --- | --- |
| **通信方式** | 被观察者直接持有观察者的引用，主动通知 | 发布者和订阅者通过中间件（如事件总线、消息队列）间接通信 |
| **耦合度** | 较高：被观察者知道观察者 | 极低：发布者和订阅者互不知晓对方 |
| **组件角色** | 主体（Subject） + 观察者（Observer） | 发布者（Publisher） + 订阅者（Subscriber） + 事件通道/代理（Broker） |
| **典型应用场景** | GUI事件处理、MVC架构中的模型-视图同步 | 消息系统、微服务通信、事件驱动架构 |


---

### 二、结构差异详解
#### 1. 观察者模式
+ **Subject（被观察者）** 维护一个观察者列表。
+ 当 Subject 状态改变时，**直接遍历列表调用每个 Observer 的 update() 方法**。
+ Observer 需要向 Subject 注册（subscribe）或注销（unsubscribe）。
+ **两者必须相互可见**（至少 Subject 持有 Observer 的引用）。

#### 2. 发布-订阅模式
+ 引入一个**中间层（Broker / Event Bus / Message Queue）**。
+ Publisher 发布消息到 Broker（通常按主题 topic 或频道 channel）。
+ Subscriber 向 Broker 订阅特定主题。
+ **Publisher 和 Subscriber 完全解耦**，彼此不知道对方的存在。

```javascript
1// 示例（如使用 EventEmitter）
2eventBus.on('news', subscriberCallback);
3eventBus.emit('news', data); // 不知道谁在监听
```

---

### 三、关键区别总结
| 维度 | 观察者模式 | 发布-订阅模式 |
| --- | --- | --- |
| **耦合性** | 紧耦合（Subject 依赖 Observer） | 松耦合（通过中介解耦） |
| **通信范围** | 通常在同一进程/应用内 | 可跨进程、跨网络（如 RabbitMQ、Kafka） |
| **复杂性** | 简单，适合小型系统 | 更复杂，适合分布式系统 |
| **性能开销** | 低（直接方法调用） | 可能较高（涉及序列化、网络传输等） |
| **调试难度** | 容易追踪调用链 | 调试困难（事件流不直观） |


---

### 四、类比理解
+ **观察者模式** 像是：老师（Subject）点名让所有学生（Observer）交作业，老师知道每个学生是谁。
+ **发布-订阅模式** 像是：学校广播站（Broker）播放“请高三学生到操场集合”，老师（Publisher）只负责发通知，学生（Subscriber）自己决定是否收听，彼此不认识。

---

### 五、实际应用举例
+ **观察者模式**：
    - Java 中的 `java.util.Observable`（已废弃，但思想仍在）
    - Vue 2 的响应式系统（基于 Object.defineProperty + 依赖收集）
+ **发布-订阅模式**：
    - 浏览器中的 `EventEmitter`、`CustomEvent`
    - Redis 的 Pub/Sub
    - Kafka、RabbitMQ 等消息中间件

---

### 总结
+ **观察者模式是发布-订阅模式在内存中的特例**。 
如果你不需要跨系统通信、追求简单高效，用观察者模式； 
如果你需要解耦、支持异步、跨服务通信，则选择发布-订阅模式。

# 大文件分片上传
```javascript
import SparkMD5 from ''; // 导入MD5计算文件哈希
const CHUNK_SIZE = 1024 * 1024 * 5; // 5MB
const THREAD_COUNT = navigator.hardwareConcurrency || 4;// cpu核心数

 function createChunk(file, chunkIndex, CHUNK_SIZE) {
  return new Promise((resolve) => {
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(file.size, start + CHUNK_SIZE);
    const spark = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();
    const blob = file.slice(start, end);
    fileReader.onload = function (e) {
      spark.append(e.target.result);
      resolve({
        start,
        end,
        chunkIndex,
        hash: spark.end(),
        blob
      })
    }
  });
  fileReader.readAsArrayBuffer(blob);
}

function cutFile(file) {
  return new Promise((resolve) => {
    const chunkCount = Math.ceil(file.size / CHUNK_SIZE);
    const threadChunkCount = Math.ceil(chunkCount / THREAD_COUNT);
    const start = i * threadChunkCount;
    const end = (i + 1) * threadChunkCount > chunkCount ? chunkCount : (i + 1) * threadChunkCount;
    const result = [];
    let finishCount = 0;
    for (let i = 0; i < THREAD_COUNT; i++) {
      // 创建一个线程，分配任务
      const worker = new Worker(async (e) => {
        const {
          file,
          CHUNK_SIZE,
          startChunkIndex: start,
          endChunkIndex: end
        } = e.data;

        const proms = [];
        for (let i = start; i < end; i++) {
          proms.push(createChunk(file, i, CHUNK_SIZE));
        }
        const chunks = await Promise.all(proms);
        postMessage(chunks);
      }, {
        type: 'module'
      })
    };

    worker.postMessage({
      file,
      CHUNK_SIZE,
      startChunkIndex: start,
      endChunkIndex: end
    });

    worker.onmessage = e => {
      for (let i = start, ; i < end; i++) {
        result[i] = e.data[i - start];
      }
      worker.terminate();// 结束线程
      finishCount++;
      if (finishCount === THREAD_COUNT) {
        resolve(result)
      }
    }
  });
}
```

# js 如何设计一个队列可以控制每次并发请求的个数
### ✅ 核心思路
+ 维护一个待执行任务队列。
+ 同时最多运行 `maxConcurrency` 个任务。
+ 每当一个任务完成，就从队列中取出下一个任务执行。
+ 支持动态添加任务。

---

### 🧱 基础实现：`TaskQueue` 类
```javascript
class TaskQueue {
    constructor(maxConcurrency = 3) {
        this.maxConcurrency = maxConcurrency; // 最大并发数
        this.running = 0;                     // 当前正在运行的任务数
        this.queue = [];                      // 等待执行的任务队列
      }
  
    // 添加一个异步任务（返回 Promise 的函数）
    add(task) {
        return new Promise((resolve, reject) => {
            this.queue.push({
                task,
                resolve,
                reject
            });
          this._next(); // 尝试执行下一个任务
        });
    }

  // 尝试启动新任务
  _next() {
      // 如果已达最大并发数 或 队列为空，则不执行
      if (this.running >= this.maxConcurrency || this.queue.length === 0) {
          return;
        }
  
      const { task, resolve, reject } = this.queue.shift();
      this.running++;
  
      // 执行任务，并在完成后继续处理队列
      Promise.resolve()
        .then(() => task())
        .then(resolve)
        .catch(reject)
        .finally(() => {
            this.running--;
            this._next(); // 递归处理下一个任务
          });
    }
}
```

### 🚀 使用示例
```javascript
// 模拟一个网络请求（延迟 1~2 秒）
function mockRequest(id) {
    return () => {
        console.log(`开始请求 ${id}`);
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`完成请求 ${id}`);
                resolve(id);
              }, Math.random() * 1000 + 1000);
          });
      };
  }

// 创建一个最多并发 2 个请求的队列
const queue = new TaskQueue(2);

// 添加 5 个请求
const promises = [];
for (let i = 1; i <= 5; i++) {
    promises.push(queue.add(mockRequest(i)));
  }

// 等待所有请求完成
Promise.all(promises).then(results => {
    console.log('所有结果:', results); // [1, 2, 3, 4, 5]
});
```

# sse用的是啥协议，前后端具体如何实现不断发送内容
### 一、SSE 的协议基础
1. **协议本质** 
SSE 基于 **HTTP/1.1** 协议，通过 `Content-Type: text/event-stream` 响应头标识数据流类型。服务器保持 TCP 连接打开，持续向客户端推送文本数据块。
2. **数据格式规范** 
服务器发送的数据需遵循以下格式：

```http
data: <payload>\n\n                # 基础数据字段
event: <event-name>\n        # 自定义事件类型（可选）
id: <message-id>\n           # 消息标识符（用于断线重连）
retry: <milliseconds>\n     # 重连间隔时间（可选）
```

    - 每条消息以 `\n\n` 结尾，多行数据需以 `data:` 开头分隔。
    - 示例：

```http
event: update
data: {"progress": 85}
id: 123
retry: 5000
```

3. **与 WebSocket 对比** 

| **特性** | SSE | WebSocket |
| --- | --- | --- |
| 协议 | HTTP/1.1 | 独立 TCP 协议 |
| 通信方向 | 单向（服务器→客户端） | 双向 |
| 数据格式 | 文本（UTF-8） | 二进制/文本 |
| 自动重连 | 支持 | 需手动实现 |
| 兼容性 | 现代浏览器（IE 不支持） | 广泛支持 |


---

### 二、前端实现：持续接收数据
前端通过 `EventSource` API 连接服务器并监听事件：

```javascript
const eventSource = new EventSource('/api/stream');
// 监听默认消息事件
eventSource.onmessage = (event) => {
  console.log('Received:', event.data); // 自动解析 data 字段
};
// 监听自定义事件
eventSource.addEventListener('update', (event) => {
  const data = JSON.parse(event.data);
  updateProgressBar(data.progress);
});
// 错误处理与重连
eventSource.onerror = (err) => {
  console.error('SSE Error:', err);
  // 浏览器自动重连（间隔由 retry 字段控制）
};
```

**关键机制**：

+ **自动重连**：连接断开后，浏览器按 `retry` 字段指定的间隔（默认 3 秒）重试。
+ **断点续传**：通过 `id` 字段标记消息，重连时浏览器发送 `Last-Event-ID` 请求头，服务器可据此恢复状态。

---

### 三、后端实现：持续发送数据
服务器需保持连接并按 SSE 格式输出数据，以 Node.js/Express 为例：

```javascript
app.get('/api/stream', (req, res) => {
  // 设置 SSE 响应头
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
// 定时推送数据
  const interval = setInterval(() => {
    const progress = Math.random() * 100;
    // 发送自定义事件
    res.write(`event: update\ndata: ${JSON.stringify({ progress })}\nid: ${Date.now()}\n\n`);
  }, 1000);
// 客户端断开时清理
  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});
```

**关键实现细节**：

1. **响应头配置** 
必须包含：

```http
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

2. **连接保活** 
    - 定期发送注释消息（`:\n`）防止代理超时。
    - 示例：`res.write(':\n'); // 心跳包`
3. **反压处理** 
监听 `req.socket.writable` 状态，避免缓冲区溢出：

```javascript
if (!res.socket.writable) {
  clearInterval(interval); // 暂停发送
}
```

---

### 四、适用场景与限制
1. **典型场景** 
    - 实时通知（如消息提醒）
    - 数据流监控（如日志、传感器数据）
    - AI 流式响应（如 ChatGPT 逐字输出）
2. **主要限制** 
    - **单向通信**：客户端无法通过同一连接发送数据（需配合 HTTP 请求）。
    - **文本数据**：不支持二进制传输（需 Base64 编码）。
    - **并发瓶颈**：单域名最多 6 个连接（浏览器限制）。

---

### 五、优化与调试建议
1. **性能优化** 
    - 启用 HTTP/2 多路复用减少连接开销。
    - 使用消息队列（如 Redis）解耦数据生产与推送。
2. **调试工具** 
    - 浏览器开发者工具的 **Network > WS** 标签页（查看 SSE 流）。
    - 命令行测试：`curl http://localhost/api/stream`。

---

### 总结
SSE 通过简单的 HTTP 长连接实现了高效的服务器推送，特别适合**实时更新、低频数据流**场景。其核心优势在于：

1. **协议简单**：基于 HTTP，无需额外协议支持。
2. **自动重连**：内置容错机制提升可靠性。
3. **开发成本低**：前后端实现均较为直观。 
对于双向通信或高频数据交互（如在线游戏），建议选择 WebSocket。

# 基于服务端的信息推送：Server Send Event（SSE）
```javascript
// 创建 EventSource 实例，连接到后端的 SSE 流
const eventSource = new EventSource('http://localhost:8080/sse');

// 处理接收到的消息
eventSource.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('Received message:', data);
  // 在这里处理数据，如更新UI等
  updateUI(data);
};

// 监听特定的事件类型
eventSource.addEventListener('customEvent', function(event) {
  const data = JSON.parse(event.data);
  console.log('Received custom event:', data);
  // 对 customEvent 做特定处理
  handleCustomEvent(data);
});

// 错误处理
eventSource.onerror = function(event) {
  console.error('SSE connection error:', event);
  // 可以尝试重连，或做其他处理
};

// 连接关闭
eventSource.onclose = function() {
  console.log('SSE connection closed');
};

// 更新UI的函数
function updateUI(data) {
  // 假设有一个 DOM 元素显示消息
  const messageContainer = document.getElementById('messages');
  const messageElement = document.createElement('div');
  messageElement.textContent = `Message: ${data.message}`;
  messageContainer.appendChild(messageElement);
}

// 特定事件的处理函数
function handleCustomEvent(data) {
  // 自定义事件的处理逻辑
  console.log('Handling custom event:', data);
}
```

```typescript
// src/hooks/useSSE.ts
import { useEffect, useRef } from 'react';

interface UseSSEOptions {
  onMessage: (data: string) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
}

export function useSSE(url: string, options: UseSSEOptions) {
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!url) return;

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      options.onOpen?.();
    };

    eventSource.onmessage = (event) => {
      options.onMessage(event.data);
    };

    eventSource.onerror = (error) => {
      options.onError?.(error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [url]);
}
```

```typescript
// src/pages/Chat.tsx
import React, { useState } from 'react';
import { useSSE } from '@/hooks/useSSE';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [chatUrl, setChatUrl] = useState<string | null>(null);

  useSSE(chatUrl || '', {
    onMessage: (data) => {
      setMessages((prev) => {
        const newMessages = [...prev];
        if (typeof data === 'string') {
          newMessages[newMessages.length - 1] += data;
        }
        return newMessages;
      });
    },
    onOpen: () => {
      setMessages((prev) => [...prev, '']); // 占位符
    },
    onError: (err) => {
      console.error('SSE error', err);
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;
    setChatUrl(`http://localhost:3000/sse?prompt=${encodeURIComponent(input)}`);
    setInput('');
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>🤖 与 AI 聊天</h2>
      <div
        style={{
          border: '1px solid #ccc',
          height: 300,
          overflowY: 'auto',
          padding: 12,
          marginBottom: 12,
        }}
      >
        {messages.map((msg, idx) => (
          <p key={idx}>{msg}</p>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: '80%' }}
        placeholder="请输入你的问题..."
      />
      <button onClick={handleSend} style={{ marginLeft: 8 }}>
        发送
      </button>
    </div>
  );
};

export default Chat;
```

# 手写Promise微队列
```javascript
// TODO: 实现一个微任务队列
function runMicroTask(fn) {
  if (process && process.nextTick) {
    process.nextTick(fn)
  } else if (typeof MutationObserver === 'function') {
    const observer = new MutationObserver(fn)
    const textNode = document.createTextNode('')
    observer.observe(textNode, { characterData: true })
    textNode.data = '1'
  } else {
    setTimeout(fn, 0)
  }
}
```

# 判断一个函数是否满足PromiseA+规范
```javascript
function isPrmoiseLike(fn) {
  return fn && typeof fn.then === 'function'
}
```

# 实现一个带有请求重试次数的请求函数
```javascript
function request(url, maxCount = 5) {
  return fetch(url).catch((err) => maxCount <= 0 ? Promise.reject(err) : request(url, maxCount - 1))
}
```

# 异步监听元素与视口的交叉状态变化（懒加载实现的一种方式）
```javascript
const lazyImages = document.querySelectorAll(".lazy-img");
const lazyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src; // 替换 data-src 为真实 URL
      lazyObserver.unobserve(img); // 加载后停止观察
    }
  });
}, { 
    root: null,        // 根元素，默认为视口（viewport）
    rootMargin: '0px', // 扩展/缩小根元素检测区域（格式同CSS margin）
    threshold: 0.1    // 触发回调的交叉比例阈值（0~1）
  }); 

lazyImages.forEach(img => lazyObserver.observe(img));
```

```javascript
import { useEffect, useRef, useState } from "react";
import { Empty, Spin } from "@arco-design/web-react";
import "./index.css";

const InfiniteScroll = ({
  loadMore,
  hasMore,
  children,
  threshold = 0.1, // 触发阈值，元素可见比例
  className = "",
  empty = false,
}) => {
  const containerRef = useRef(null);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // 加载更多数据的处理函数
  const handleLoadMore = () => {
    if (loading || !hasMore) return;

    setLoading(true);
    loadMore().finally(() => {
      setLoading(false);
    });
  };

  // 设置IntersectionObserver
  useEffect(() => {
    // 初始化观察器
    const options = {
      root: containerRef.current,
      rootMargin: "0px 0px 50px 0px", // 减少提前触发距离
      threshold,
    };

    // 创建观察器实例
    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        handleLoadMore();
      }
    }, options);

    // 开始观察哨兵元素
    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    // 初始加载检查 - 仅在组件首次挂载时执行
    if (hasMore && !loading && !hasInitialized) {
      setHasInitialized(true);
      handleLoadMore();
    }

    // 清理函数
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, hasMore, threshold, loading]);

  return (
    <div
      ref={containerRef}
      className={`infinite-scroll-container ${className}`}
    >
      {children}

      {/* 哨兵元素 - 用于触发加载更多 */}
      <div ref={sentinelRef} className="sentinel-element"></div>

      {!hasMore && empty && (
        <Empty description="暂无数据" className="empty-data" />
      )}
      {/* 滚动加载指示器 */}
      {loading && hasMore && (
        <div className="loading-container">
          <Spin size="small" />
          <span className="loading-text">加载中...</span>
        </div>
      )}
    </div>
  );
};

export default InfiniteScroll;

```

# 如何监控用户页面卡顿（longtask）
```javascript
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 100) {
      // todo
      console.log('上报到数据中心');
    }
  });

observer.observe({
  entryTypes: ['longtask'],            // 任务名称数组
});
```

# 请求取消（AbortController）
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

```javascript
// 创建 AbortController 实例
const controller = new AbortController();

// 发送 Fetch 请求时绑定 signal
fetch('https://api.example.com/data', {
  signal: controller.signal
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => {
    if (error.name === 'AbortError') {
      console.log('请求已取消'); // 捕获取消错误[1,2,4](@ref)
    } else {
      console.error('其他错误:', error);
    }
  });

// 手动取消请求
controller.abort();
```

# 给fetch 添加超时时间
```javascript
// 给fetch添加超时功能
function createRequestWithTimeout(timeout = 3000) {
  return function (url, options) {
    return new Promise((resolve, reject) => {
      const abort = new AbortController(); // 创建 AbortController 实例，用于中断请求
      options = options || {}; // 兼容 options 为 null/undefined 的情况

      // 若外部已传入 signal（比如其他中断逻辑复用），监听其 abort 事件并联动中断当前请求
      if (options.signal) {
        options.signal.addEventListener('abort', () => {
          abort.abort(); // 触发当前请求的中断
        });
      }

      // 将当前请求的 AbortSignal 注入 options，让 fetch 能响应中断
      options.signal = abort.signal;

      // 超时定时器：超时后触发 reject 并主动中断请求
      setTimeout(() => {
        reject(new Error('Request timeout')); // 抛出超时错误
        abort.abort(); // 主动中断 fetch 请求
      }, timeout);

      // 发起 fetch 请求，将结果交给 Promise 的 resolve/reject
      fetch(url, options).then(resolve, reject);
    });
  };
}

// 调用
const requestWithTimeout = createRequestWithTimeout(5000); // 配置 5s 超时
requestWithTimeout('https://api.example.com/data')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error('请求失败：', err));
```

# 封装一个链式调用函数
```javascript
class Calculator {
  constructor(value = 0) {
    this.value = value;
  }
  
  add(num) {
    this.value += num;
    return this; // 关键：返回当前对象
  }
  
  multiply(num) {
    this.value *= num;
    return this;
  }
  
  getResult() {
    return this.value;
  }
}

// 链式调用示例
const result = new Calculator(5)
  .add(3)      // 5+3=8
  .multiply(2) // 8 * 2=16
  .getResult(); // 16
```

```javascript
function createPerson(name) {
  return {
    name,
    setName(newName) {
      this.name = newName;
      return this; // 返回对象本身
    },
    greet() {
      console.log(`Hello, ${this.name}!`);
      return this;
    }
  };
}

// 链式调用
createPerson("Alice")
  .setName("Bob")
  .greet(); // 输出: Hello, Bob!function createPerson(name) {
  return {
    name,
    setName(newName) {
      this.name = newName;
      return this; // 返回对象本身
    },
    greet() {
      console.log(`Hello, ${this.name}!`);
      return this;
    }
  };
}

// 链式调用
createPerson("Alice")
  .setName("Bob")
  .greet(); // 输出: Hello, Bob!
```

```javascript
class TaskChain {
  constructor() {
    this.tasks = [];
    setTimeout(() => this.next(), 0); // 异步启动
  }
  
  do(taskName) {
    this.tasks.push(() => {
      console.log(`Executing: ${taskName}`);
      this.next();
    });
    return this;
  }
  
  delay(ms) {
    this.tasks.push(() => {
      setTimeout(() => {
        console.log(`Delayed ${ms}ms`);
        this.next();
      }, ms);
    });
    return this;
  }
  
  next() {
    const task = this.tasks.shift();
    task?.();
  }
}

// 链式调度异步任务
new TaskChain()
  .do("Task 1")
  .delay(1000)
  .do("Task 2");
```

# 虚拟列表实现
```typescript
import React, { useState, useEffect, useRef, useCallback } from "react";

interface VirtualListItemProps<T> {
  index: number;
  data: T;
  style: React.CSSProperties;
}

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  windowHeight: number;
  renderItem: (props: VirtualListItemProps<T>) => React.ReactNode;
  onReachEnd?: () => void;
  threshold?: number;
}

const VirtualList = <T,>({
  items,
  itemHeight,
  windowHeight,
  renderItem,
  onReachEnd,
  threshold = 50,
}: VirtualListProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // 计算可见区域的起始和结束索引
  const visibleCount = Math.ceil(windowHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount + 2, items.length); // 多渲染几个元素以避免空白

  // 计算偏移量
  const offsetY = startIndex * itemHeight;

  // 计算总高度，用不可见元素撑开高度
  const totalHeight = items.length * itemHeight;

  // 处理滚动事件
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);

      // 检查是否接近底部，触发加载更多
      const scrollBottom =
        containerRef.current.scrollHeight -
        containerRef.current.scrollTop -
        containerRef.current.clientHeight;
      if (scrollBottom <= threshold && onReachEnd) {
        onReachEnd();
      }
    }
  }, [threshold, onReachEnd]);

  // 监听滚动事件
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => {
        container.removeEventListener("scroll", handleScroll);
      };
    }
  }, [handleScroll]);

  // 渲染可见项
  const renderItems = () => {
    const visibleItems = [];

    for (let i = startIndex; i < endIndex; i++) {
      const item = items[i];
      visibleItems.push(
        renderItem({
          index: i,
          data: item,
          style: {
            position: "absolute",
            top: `${i * itemHeight}px`,
            width: "100%",
            height: `${itemHeight}px`,
          },
        })
      );
    }

    return visibleItems;
  };

  return (
    <div
      ref={containerRef}
      style={{
        height: `${windowHeight}px`,
        overflowY: "scroll", // 确保垂直滚动条始终显示
        overflowX: "hidden",
        position: "relative",
        outline: "none", // 移除焦点轮廓
        // 自定义滚动条样式 (WebKit浏览器)
        scrollbarWidth: "thin",
        scrollbarColor: "#888 #f1f1f1",
      }}
      tabIndex={-1} // 使div可聚焦但不通过tab键访问
    >
      <style>
        {`
          /* WebKit浏览器滚动条样式 */
          div::-webkit-scrollbar {
            width: 8px;
          }
          
          div::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          
          div::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
          }
          
          div::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        `}
      </style>
      <div
        style={{
          height: `${totalHeight}px`,
          position: "relative",
        }}
      >
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
          }}
        >
          {renderItems()}
        </div>
      </div>
    </div>
  );
};

export default VirtualList;


// 使用
<VirtualList
  items={data}
  itemHeight={120} // 每项高度
  windowHeight={600} // 可视区域高度
  renderItem={renderItem}
  onReachEnd={loadMoreData}
  threshold={100} // 距离底部100px时触发加载
/>
```

# 如何解决倒计时误差
```javascript
// 优势​：减少因页面不可见导致的误差
let total = 10; // 总时间（秒）
let lastStamp = null;
let timer = null;

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // 记录暂停时间点
    pauseTime = Date.now();
  } else {
    // 补偿时间差
    const resumeTime = Date.now();
    elapsed += resumeTime - pauseTime;
  }
});

function updateCount() {
  clearTimeout(timer);
  const nowStamp = Date.now();
  const pastTime = nowStamp - firstStamp;
  const remainTime = total * 1000 - pastTime;
  
  if (remainTime > 0) {
    console.log(`剩余时间：${Math.floor(remainTime/1000)}秒`);
    lastStamp = nowStamp;
    timer = setTimeout(updateCount, remainTime % 1000);
  } else {
    console.log("倒计时结束");
  }
}
```

```javascript
// 适用场景​：超高精度需求（如金融交易倒计时）
// 主线程
const worker = new Worker('countdown.worker.js');
worker.postMessage(10); // 10秒倒计时
worker.onmessage = (e) => console.log(e.data);

// countdown.worker.js
self.onmessage = (e) => {
  let count = e.data;
  const timer = setInterval(() => {
    count--;
    self.postMessage(count);
    if (count === 0) clearInterval(timer);
  }, 1000);
};
```

```javascript
// 优势​：动画流畅，适合 UI 级倒计时
let startTime = performance.now();
const totalDuration = 10000; // 10秒倒计时

const countDown = () => {
  const elapsedTime = performance.now() - startTime;
  const remaining = totalDuration - elapsedTime;
  if (remaining > 0) {
    console.log(`剩余时间：${Math.floor(remaining/1000)}秒`);
    requestAnimationFrame(countDown);
  } else {
    console.log("倒计时结束");
  }
};
requestAnimationFrame(countDown);
```

# localStorage操作是同步还是异步
     `localStorage` 的操作是**同步**的。这意味着当执行读写操作时，JavaScript 主线程会被完全阻塞，直到操作完成。以下是关键细节和影响分析：

---

### ⚠️ 核心特性与影响
1. **阻塞式执行** 
    - 调用 `localStorage.getItem()` 或 `setItem()` 时，主线程会暂停，导致：
        * 后续代码延迟执行
        * 动画卡顿（若在 `requestAnimationFrame` 中调用）
        * 用户交互无响应（点击、滚动等事件被挂起）
    - **示例**： 

```javascript
console.log('Start'); 
localStorage.setItem('data', largeObject); // 主线程阻塞于此
console.log('End'); // 需等待写入完成才执行
```

2. **性能瓶颈** 
    - **读写速度**：受磁盘 I/O 限制，尤其在低端设备上，单次操作可能耗时数毫秒至数十毫秒。
    - **数据量敏感**：存储超过 1MB 的数据时，`setItem` 可能阻塞主线程 >50ms。
3. **跨标签页同步** 
    - 同源页面共享 `localStorage`，任一标签页的修改会触发其他标签页的 `storage` 事件。
    - **注意**：事件监听需在页面加载后绑定，否则可能丢失变更通知。

---

### 🆚 与异步存储方案对比
| **特性** | `localStorage` (同步) | `IndexedDB` (异步) | `Cache API` (异步) |
| --- | --- | --- | --- |
| **线程模型** | 阻塞主线程 | 独立线程运行 | 独立线程运行 |
| **适用场景** | 小数据（≤5MB） | 大数据（≥100MB） | 网络请求缓存 |
| **性能风险** | 高（卡顿、无响应） | 低 | 低 |
| **API 复杂度** | 简单（键值对） | 复杂（事务、索引） | 中等（请求/响应对象） |


---

### 💡 优化建议
1. **避免大数据操作** 
    - 单次存储建议 ≤ 100KB，超限数据改用 `IndexedDB`。
    - **序列化优化**：存储前压缩 JSON（如使用 `lz-string`）。
2. **异步封装** 
通过 `setTimeout` 或 `Web Worker` 避免阻塞主线程：

```javascript
// 封装异步写入
function setLocalStorage(key, value) {
  setTimeout(() => localStorage.setItem(key, value), 0);
}
```

3. **内存缓存层** 
频繁读取时，优先使用内存变量，定期持久化：

```javascript
let cache = {};
function getCached(key) {
  if (!cache[key]) cache[key] = localStorage.getItem(key);
  return cache[key];
}
```

---

### ⚡ 关键总结
+ **同步本质**：`localStorage` 的读写会**阻塞主线程**，影响性能。
+ **适用场景**：仅适合存储**小量、非高频**数据（如用户偏好设置）。
+ **替代方案**：高频或大数据场景优先选择 `IndexedDB` 或 `Cache API`。 
合理使用存储方案，可显著提升应用响应速度与用户体验。

# 如何实现项目主题切换
在 React 中实现**主题切换（Theme Switching）**，通常涉及以下核心思路：

+ **定义多套 CSS 主题变量（如亮色/暗色）**
+ **通过 Context 管理全局主题状态**
+ **动态应用主题类名或 CSS 变量**
+ **可选：持久化用户偏好（如 localStorage）**

---

### ✅ 方案一：使用 CSS 变量 + React Context（推荐）
#### 1. 定义主题 CSS 变量
```css
/* styles/themes.css */
:root {
    /* 默认亮色主题 */
    --bg-color: #ffffff;
    --text-color: #333333;
    --primary-color: #007bff;
  }

[data-theme="dark"] {
    --bg-color: #121212;
    --text-color: #f5f5f5;
    --primary-color: #4da6ff;
  }
```

💡 使用 `[data-theme]` 属性选择器，避免污染全局 `:root`。

#### 2. 创建 ThemeContext
```typescript
// context/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
type ThemeContextType = {
    theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
      }
    return context;
  };

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>('light');
  
    // 从 localStorage 恢复用户偏好
    useEffect(() => {
        const saved = localStorage.getItem('theme') as Theme | null;
        if (saved && ['light', 'dark'].includes(saved)) {
            setTheme(saved);
          } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark'); // 遵循系统偏好
          }
      }, []);
  
    // 应用主题到 <html> 元素
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
      }, [theme]);
  
    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
      };
  
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
        {children}
    </ThemeContext.Provider>
    );
};
```

#### 3. 在组件中使用
```typescript
// App.tsx
import { ThemeProvider } from './context/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';

function App() {
  return (
    <ThemeProvider>
    <div className="app">
      <h1>Hello Theme!</h1>
    <ThemeToggle />
    </div>
    </ThemeProvider>
      );
}

// components/ThemeToggle.tsx
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      切换到 {theme === 'light' ? '暗色' : '亮色'} 主题
    </button>
  );
};
```

#### 4. 在样式中使用 CSS 变量
```css
/* components/App.css */
.app {
  background-color: var(--bg-color);
  color: var(--text-color);
  padding: 20px;
}
```

---

### ✅ 方案二：使用 CSS Modules 或 Styled-components（进阶）
如果你使用 **CSS-in-JS**（如 styled-components），可以这样写：

```typescript
// 使用 styled-components
import styled, { ThemeProvider as SCThemeProvider } from 'styled-components';

const lightTheme = { bg: '#fff', text: '#333' };
const darkTheme = { bg: '#121212', text: '#f5f5f5' };

const AppContainer = styled.div`
  background: ${(props) => props.theme.bg};  
  color: ${(props) => props.theme.text};
`;

// 在顶层包裹 SCThemeProvider，并传入 theme 对象
```

⚠️ 注意：React 官方 Context + CSS 变量方案更轻量、通用，适合大多数项目。

---

### 🔒 补充建议
#### 1. 支持系统偏好自动切换
已在 `useEffect` 中通过 `window.matchMedia('(prefers-color-scheme: dark)')` 实现。

#### 2. 避免闪烁（FOUC）
在 `<head>` 中加入内联脚本，防止页面加载时闪现错误主题：

```html
<!-- public/index.html -->
<script>
   // 优先读取 localStorage，否则用系统偏好
  const theme = localStorage.getItem('theme') ||  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
   document.documentElement.setAttribute('data-theme', theme);
</script>
```

#### 3. 类型安全（TypeScript）
如上所示，使用 `type Theme = 'light' | 'dark'` 确保主题值合法。

---

### ✅ 总结
| 步骤 | 关键点 |
| --- | --- |
| 1. 定义主题 | 使用 CSS 变量 + `[data-theme]`<br/> 选择器 |
| 2. 状态管理 | `React Context`<br/> + `useState` |
| 3. 持久化 | `localStorage`<br/> 保存用户选择 |
| 4. 自动适配 | 读取系统 `prefers-color-scheme` |
| 5. 防闪烁 | 在 HTML 中提前设置 `data-theme` |


这套方案**轻量、可维护、无障碍兼容**，是 React 社区广泛采用的最佳实践。

