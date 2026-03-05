---
title: "工程化常见问题"
sidebar_position: 1
---

# 项目面试准备指南：pnpm + Monorepo + Rollup + Vite (进阶深挖版)
---

## 1. pnpm：文件系统与依赖解析机制
### Q1: pnpm 的硬链接 (Hard Link) 和符号链接 (Symbolic Link) 到底有什么区别？在文件系统层面是如何运作的？
**浅层回答**：硬链接省空间，软链组织结构。 
**深挖原理 (Level 2)**：

+ **Inode (索引节点)**：在 Linux/Unix 文件系统中，文件由 Inode 和 Block (数据块) 组成。Inode 存储元数据（权限、大小、拥有者），Block 存储实际内容。文件名只是指向 Inode 的一个指针。
+ **硬链接 (Hard Link)**：
    - **原理**：创建一个指向**同一个 Inode** 的新文件名。
    - **效果**：`project/node_modules/react/index.js` 和 `~/.pnpm-store/.../react/index.js` 指向完全相同的物理磁盘块。修改其中一个，另一个也会变（pnpm 默认是只读的，防止误改）。删除其中一个，只是减少了 Inode 的引用计数，只有计数为 0 时数据才会被回收。
    - **限制**：**不能跨分区/文件系统**（因为 Inode 编号只在当前分区唯一）。
+ **符号链接 (Symbolic Link / Soft Link)**：
    - **原理**：创建一个**独立的文件**（有自己的 Inode），其内容是另一个文件的**路径字符串**。
    - **作用**：pnpm 用它来构建 `node_modules` 的树状拓扑结构，欺骗 Node.js 的解析算法，让它以为依赖就在这里。

### Q2: 既然 pnpm 使用硬链接，如果我在项目中修改了 `node_modules` 里的代码，会不会影响其他项目？
**深挖原理 (Level 3)**：

+ **理论上会**：因为它们指向同一个 Inode，物理数据是同一份。
+ **pnpm 的防护机制**：pnpm 使用 **Content-addressable Store (CAS，内容寻址存储)**。
    - 当包被下载并解压到 Store 时，文件名是基于文件内容的 **Hash (SHA-512)** 生成的。
    - pnpm 会将这些文件设置为 **只读 (Read-Only)** 权限。如果你尝试保存修改，操作系统会拒绝。
+ **Copy-on-Write (COW)**：如果你强制修改权限并保存，某些现代文件系统（如 APFS, Btrfs）支持 COW，但这取决于 OS。通常情况下，pnpm 依赖权限位来阻止修改。

### Q3: 为什么 npm/yarn (v1) 的扁平化结构会导致“幽灵依赖”，而 pnpm 不会？请结合 Node.js 模块解析算法说明。
**深挖原理 (Level 3)**：

+ **Node.js 解析算法**：
    1. 当 `require('foo')` 时，Node 会从当前目录的 `node_modules` 开始查找。
    2. 如果找不到，就跳到 **上一级目录** 的 `node_modules`，直到根目录。
+ **npm/yarn 的扁平化 (Hoisting)**：
    - 假设 A 依赖 B (v1.0)，B 依赖 C (v1.0)。
    - npm 为了去重，会将 A, B, C 都提升到顶层 `node_modules`。
    - **后果**：你在 A 的代码里直接 `require('C')`。Node 在顶层 `node_modules` 找到了 C，于是运行成功。但 `package.json` 里根本没写 C。这就是幽灵依赖。
+ **pnpm 的嵌套结构**：
    - 顶层 `node_modules` 只有 A。
    - A 是一个软链，指向 `.pnpm/A@1.0.0/node_modules/A`。
    - 在这个 `.pnpm/.../A` 目录下，有一个 `node_modules`，里面包含了 B（软链）。
    - **关键点**：这个目录里 **没有 C**。
    - 如果你在 A 里 `require('C')`，Node 在 A 的当前 `node_modules` 找不到，往上找是 `.pnpm/A@1.0.0/node_modules`（依然没有 C），再往上是 `.pnpm`（没有），最后报错。
    - 这完美契合了“只能使用声明的依赖”这一原则。

---

## 2. Monorepo：依赖图与构建编排
### Q1: Monorepo 中的依赖循环 (Circular Dependency) 是怎么产生的？工具如何检测和处理？
**深挖原理 (Level 2)**：

+ **场景**：Package A 引用 Package B，Package B 又引用 Package A。
+ **后果**：
    - **安装时**：pnpm 创建软链时可能陷入死循环（实际上 pnpm 能处理符号链接循环，但在构建/运行时会出错）。
    - **构建时**：Rollup/Webpack 解析 AST 时会发现无限递归引用，导致 Stack Overflow 或构建失败。
+ **拓扑排序 (Topological Sort)**：
    - 构建工具（如 pnpm filter, Turborepo, Nx）在执行任务前，会先分析 `package.json` 的依赖关系，构建一个 **DAG (有向无环图)**。
    - 如果发现图中有环，DAG 构建失败，工具会报错并指出循环路径。
    - **算法**：通常使用 Kahn 算法或 DFS 来检测环并生成执行顺序（先 build 被依赖的包，再 build 依赖它的包）。

---

## 3. Rollup：Tree Shaking 与 AST
### Q1: Tree Shaking 到底是怎么实现的？为什么 Webpack 早期做不到 Rollup 这么好？
**浅层回答**：基于 ESM 的静态分析。 
**深挖原理 (Level 3)**：

+ **静态分析 (Static Analysis)**：
    - ESM (`import`/`export`) 的结构是静态的，在编译时就能确定，不需要运行代码。相比之下，CommonJS (`require`/`module.exports`) 是动态的，可以在 `if` 语句里 require，导致无法静态分析。
+ **AST (抽象语法树)**：
    1. Rollup 解析代码生成 AST。
    2. **标记 (Marking)**：从入口文件 (entry) 出发，标记所有被 `import` 且被使用的变量/函数。
    3. **包含 (Inclusion)**：生成 bundle 时，只包含被标记的节点。
+ **Scope Hoisting (作用域提升)**：
    - Rollup 默认会将所有模块的代码放入同一个作用域（Module Scope）中，而不是像 Webpack 那样为每个模块包裹一个 `function(module, exports) { ... }`。
    - **优势**：代码体积更小，执行速度更快（函数闭包开销小）。
    - **难点**：变量命名冲突。Rollup 会自动重命名冲突的变量（如 `index$1.js`）。
+ **Side Effects (副作用)**：
    - **核心难题**：如果 `import './utils'`，但 `utils.js` 里有一句 `window.a = 1`，Rollup 敢删掉它吗？不敢。这就是副作用。
    - `package.json`** 的 **`sideEffects: false`：这是开发者显式告诉打包工具：“我的包里没有修改全局变量等副作用，如果没被用到，请放心删掉整个文件。”

### Q2: 你的组件库构建为了 ESM 和 CJS 两种格式，这在处理 default export 时会有什么坑？
**深挖原理 (Level 2)**：

+ **CommonJS 的导出对象**：`module.exports` 是一个对象。
+ **ESM 的 Default**：`export default` 在 ESM 中其实是一个名为 `default` 的具名导出。
+ **互操作性 (Interop) 问题**：
    - 当 CJS 引用 ESM 时：Node.js 可能会把 ESM 的 `default` 挂载在 `module.exports.default` 上。导致用户必须写 `require('pkg').default` 才能拿到组件。
    - **解决方案**：Rollup 的 `output.exports: 'named'` 或 `'auto'` 配置，以及 babel 插件的 `__esModule` 标记，试图抹平差异。但在编写组件库时，**推荐使用 Named Exports (**`export const Button = ...`**) 替代 Default Export**，彻底规避这个问题。

---

## 4. Vite：Dev Server 与 Bundleless
### Q1: Vite 在开发环境使用了 esbuild，生产环境却用 Rollup，为什么不统一用 esbuild？
**深挖原理 (Level 2)**：

+ **esbuild (Go)**：
    - **优势**：极快（CPU 密集型任务，并行化做得好）。适合开发环境的依赖预构建（Pre-bundling）和 TS 转译。
    - **劣势**：**代码分割 (Code Splitting)** 和 **CSS 处理** 还不够成熟灵活。生态插件不如 Rollup 丰富。
+ **Rollup (JS)**：
    - **优势**：成熟、产物极其精简（Scope Hoisting）、插件生态极其强大（处理各种诡异的遗留代码、CSS 提取、图片压缩）。适合生产环境追求极致体积和兼容性。
+ **Rolldown** (未来)：Evan You 正在用 Rust 写 Rolldown，旨在统一开发和生产，替代 esbuild 和 Rollup。

### Q2: 浏览器原生支持 ESM，那为什么 Vite 还需要“依赖预构建”？直接让浏览器加载 node_modules 里的包不行吗？
**深挖原理 (Level 3) - 瀑布流问题**：

+ **问题 1：CommonJS 兼容性**。React 等很多老包依然发布 CommonJS 格式，浏览器读不懂 `require`。Vite 必须用 esbuild 把它们转成 ESM。
+ **问题 2：网络瀑布流 (Network Waterfall)**。
    - 假设 `import { debounce } from 'lodash-es'`.
    - `lodash-es` 内部包含 600+ 个文件，且互相 import。
    - 如果不预构建，浏览器会发起 600+ 个 HTTP 请求。
    - **HTTP/1.1 限制**：浏览器对同一域名只有 6 个并发连接。
    - **结果**：请求阻塞，页面加载极慢。
+ **Vite 的解法**：
    - 使用 esbuild 将 `lodash-es` 的 600 个文件打包成 **一个** (或少数几个) ESM 模块。
    - 浏览器只需要发起 1 个请求。

### Q3: Vite 的 HMR 是如何精确控制更新范围的？
**深挖原理 (Level 2)**：

+ **HMR Boundary (热更新边界)**：
    - 当你修改了 `Button.tsx`，Vite Server 监听到文件变化。
    - 它会查看该模块是否通过 `import.meta.hot.accept()` 接受了自身更新。
    - 如果 `Button.tsx` 没有接受（React 组件通常由 `react-refresh` 插件自动插入 accept 代码），Vite 会沿着依赖树**向上冒泡**。
    - 找到最近的一个“接受更新”的父模块（通常是 `App.tsx` 或 `main.tsx`），重新加载该模块及其依赖。
+ **Websocket**：
    - Vite Server 通过 WebSocket 向浏览器发送 `{ type: 'update', updates: [...] }` 消息。
    - 浏览器端的 Vite Client (`@vite/client`) 收到消息，动态 `import()` 新的模块带上时间戳（Bust Cache），执行模块代码，替换旧逻辑。

---

## 5. 实战场景深挖
### Q: 如果你的 Monorepo 变得非常大（100+ packages），pnpm 和 TypeScript 会遇到什么性能瓶颈？如何优化？
**深挖原理 (Level 3)**：

+ **TypeScript 瓶颈**：
    - **现象**：VSCode 变卡，类型检查内存溢出 (OOM)。
    - **原因**：TS 需要加载整个项目图来推导类型。
    - **优化**：
        1. **Project References (Composite Projects)**：将每个 package 配置为独立的 TS 项目 (`tsconfig.json` 中 `composite: true`)。TS 只重构改变的部分，利用 `.tsbuildinfo` 缓存。
        2. **Strip Internal Types**：在 `d.ts` 生成时，剥离私有类型，减少类型体积。
+ **pnpm 瓶颈**：
    - 虽然 pnpm 安装快，但 post-install 脚本（如 build）可能会慢。
    - **优化**：使用 Turborepo 或 Nx 进行**增量构建 (Incremental Build)** 和 **远程缓存 (Remote Cache)**。如果 CI 上次构建过 hash 为 `abc` 的包，这次直接下载产物，不再重复构建。

---

## 6. 现代化构建工具横向对比 (Bonus)
除了 Vite 和 Rollup，面试官可能会问及生态圈里的其他竞争者，特别是基于 Rust/Go 的高性能工具。

### 1. Webpack (v5)
+ **地位**：老牌霸主，生态最丰富。
+ **特点**：
    - **Module Federation (模块联邦)**：微前端的核心技术，允许在运行时动态加载其他应用的模块。
    - **持久化缓存**：v5 极大提升了二次构建速度。
+ **缺点**：配置极其复杂，基于 JS 编写，大型项目冷启动和 HMR 依然慢。

### 2. esbuild
+ **地位**：速度之王，Vite 的基石。
+ **特点**：
    - **Go 语言编写**：利用多线程并行，比 JS 工具快 10-100 倍。
    - **专注**：主要做 transform (TS/JS -> JS) 和 minify。
+ **缺点**：代码分割 (Code Splitting) 和 CSS 处理功能较弱，插件生态不如 Webpack/Rollup，通常不单独用于生产环境打包（Vite 生产环境用 Rollup 就是这个原因）。

### 3. 字节跳动前端工具链 (Rstack)
字节跳动构建了一整套基于 Rust 的高性能 Web 工程体系，通常统称为 **Rstack**。

#### A. Rspack (Rust Bundler)
+ **定位**：**高性能 Webpack 替代品**。
+ **核心优势**：
    - **Rust 编写**：性能极致，比 Webpack 快 10-20 倍。
    - **Webpack 兼容**：极力保持与 Webpack 的 Loader/Plugin 接口兼容，旨在让存量巨型项目能以最低成本迁移。
+ **适用场景**：大型 Webpack 项目优化构建速度。

#### B. Rsbuild (Build Tool)
+ **定位**：**开箱即用的构建工具**（类似 Vite，但底层是 Rspack）。
+ **关系**：`Rsbuild = Rspack + 开箱即用的配置 + 插件系统`。
+ **前身**：Modern.js Builder。
+ **特点**：
    - 不再需要写复杂的 `webpack.config.js` 或 `rspack.config.js`。
    - 提供了一流的开发体验，对标 Vite，但构建速度更快（特别是冷启动和生产构建）。

#### C. Modern.js (Web Framework)
+ **定位**：**企业级全栈 React 框架**（类似 Next.js）。
+ **关系**：底层构建能力由 **Rsbuild** 提供。
+ **能力**：集成了 SSR (服务端渲染)、BFF (Backend for Frontend)、微前端等高级功能，是一套完整的解决方案。

#### D. 生态周边
+ **Rslib**：基于 Rspack 的**组件库/Library 开发工具**（对标 tsup/Rollup）。
+ **Rspress**：基于 Rspack 的**静态站点生成器**（对标 VitePress/Docusaurus），构建速度极快。
+ **Rsdoctor**：**构建分析工具**，可视化分析 Bundle 大小、编译耗时、重复包等问题（对标 webpack-bundle-analyzer 但更强大）。

### 4. Turbopack
+ **地位**：Vercel (Next.js 团队) 出品，Webpack 作者 Tobias Koppers 亲自操刀。
+ **特点**：
    - **Rust 编写**：号称比 Vite 快 10 倍（虽有争议）。
    - **增量计算**：核心架构基于增量计算引擎，只计算变动的部分。
+ **场景**：目前主要绑定在 Next.js 生态中。

### 5. Parcel (v2)
+ **地位**：零配置 (Zero Configuration)。
+ **特点**：
    - 开箱即用，支持各种文件类型（HTML, CSS, JS, Images），自动安装依赖。
    - v2 核心部分也用 Rust 重写了。

