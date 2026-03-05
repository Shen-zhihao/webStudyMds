---
title: "React 组件库搭建指南"
sidebar_position: 4
---

# 从零到一：现代化 React 组件库搭建指南
> 基于 TypeScript + PropTypes 双重校验的 React 组件库，采用 Monorepo 架构，配合 ESLint + Prettier 代码规范，使用 Rollup 进行打包构建。
>
> 项目地址：[https://www.npmjs.com/package/laborer996-react-design](https://www.npmjs.com/package/laborer996-react-design)
>

## 🎯 项目架构
### 技术栈选型
+ **开发语言**: TypeScript + JavaScript
+ **UI 框架**: React 18+
+ **校验方案**: TypeScript + PropTypes 双重校验
+ **架构模式**: Monorepo (多包管理)
+ **包管理器**: pnpm
+ **构建工具**: Rollup
+ **代码规范**: ESLint + Prettier
+ **开发工具**: Vite

### 项目结构
```plain
组件库/
├── packages/
│   ├── components/          # 组件包
│   │   ├── src/
│   │   │   ├── Toast/      # Toast 组件
│   │   │   ├── Message/    # Message 组件
│   │   │   ├── VirtualList/ # 虚拟列表组件
│   │   │   └── index.ts    # 入口文件
│   │   ├── types/          # TypeScript 声明
│   │   └── package.json
│   ├── utils/              # 工具包
│   │   ├── src/
│   │   └── package.json
│   └── example/            # 示例应用
│       ├── src/
│       └── package.json
├── rollup.config.js        # Rollup 配置
├── tsconfig.json           # TypeScript 配置
├── .eslintrc.js           # ESLint 配置
├── .prettierrc            # Prettier 配置
└── package.json           # 根配置
```

## Monorepo 架构在这个项目中的优势
### 1. 模块化和关注点分离
该项目通过 Monorepo 架构将不同的功能模块分离到独立的包中：

+ components: 核心 UI 组件库，包含 Toast、Message 和 VirtualList 组件
+ utils: 通用工具函数包
+ example: 示例应用程序，用于展示和测试组件库

这种分离使得每个包都有明确的职责，便于维护和扩展。

### 2. 无缝的本地开发体验
通过 pnpm workspace 协议，example 包可以直接引用本地的 components 和 utils 包：

```json
{
  "dependencies": {
    "@my-ui/components": "workspace:*",
    "@my-ui/utils": "workspace:*"
  }
}
```

这种方式的优势包括：

+ 修改组件库代码后，示例应用会立即反映变化，无需重新发布或安装
+ 开发过程中可以实时测试组件库的功能
+ 避免了发布测试版本的繁琐过程

### 3. 统一的配置管理
项目在根目录统一管理各种配置：

+ TypeScript 配置: 通过根目录的 tsconfig.json 统一配置所有包的 TypeScript 编译选项
+ 代码规范: 通过 ESLint 和 Prettier 统一代码风格
+ 构建配置: 使用统一的 rollup.config.js 进行组件库打包

这确保了整个项目的一致性，同时减少了重复配置。

### 4. 高效的依赖管理
通过 pnpm-workspace.yaml 定义工作区：

```yaml
packages:
  - 'packages/*'
```

这种管理方式的优势：

+ 所有包共享同一个依赖存储，节省磁盘空间
+ 统一安装和管理所有包的依赖
+ 避免版本冲突问题

### 5. 独立的构建和发布流程
每个包都可以独立构建和发布：

```json
{
  "scripts": {
    "build": "rollup -c ../../rollup.config.js"
  }
}
```

这种设计使得：

+ 可以单独构建和发布某个包，而不影响其他包
+ 支持不同的构建工具和配置（components 使用 Rollup，example 使用 Vite）
+ 便于版本管理和发布策略制定

### 6. 便于测试和演示
example 包作为一个完整的应用程序，可以充分展示组件库的功能：

```tsx
import { toast, message } from '@my-ui/components';
```

这种方式的好处：

+ 提供真实的使用场景来测试组件
+ 方便进行集成测试
+ 为用户提供使用示例

### 7. 版本同步和一致性
所有包在根目录的 package.json 中统一管理版本：

```json
{
  "version": "1.1.2"
}
```

这确保了：

+ 所有包使用相同的版本号，便于管理
+ 依赖关系清晰明确
+ 发布时版本一致性得到保障

### 8. 增强的开发体验
项目提供了丰富的开发脚本：

```json
{
  "scripts": {
    "dev": "pnpm --filter example dev",
    "build": "rollup -c",
    "lint": "eslint packages/ --ext .ts,.tsx,.js,.jsx"
  }
}
```

这些脚本提供了：

+ 一键启动开发环境
+ 统一的代码检查和格式化
+ 简化的构建和清理流程

### 项目 Monorepo 结构解析
这个项目采用了基于 pnpm 的 Monorepo 架构，将不同的功能模块组织在独立的包中，实现了代码的模块化和复用。

#### 工作区配置(Workspace)
"Workspace"（工作区）这个术语准确地描述了 pnpm 管理多包项目的方式。

它不是简单的一个目录，而是一个逻辑工作空间，包含了多个相互关联的包。

```yaml
packages:
  - 'packages/*'
```

这意味着整个 `packages/` 目录下的所有子目录都被视为同一个工作区的一部分。

#### 包结构
##### 项目包含三个主要包：
+ components - 核心组件库 
	包含 Toast、Message、VirtualList 等 UI 组件 
	使用 Rollup 打包，支持 ESM 和 CJS 格式 
	提供 TypeScript 类型声明文件
+ utils - 工具函数包 
	提供通用工具函数 
	同样使用 Rollup 打包
+ example - 示例应用 
	使用 Vite 构建的 React 应用 
	展示如何使用组件库

##### 包间依赖关系
在 example/package.json 中可以看到包间的依赖关系：

```bash
"dependencies": {
  "@my-ui/components": "workspace:",
  "@my-ui/utils": "workspace:",
  "react": "^18.2.0",
  "react-dom": "^18.2.0"
}
```

使用 "workspace:*" 表示直接链接到工作区中的包，这样可以确保始终使用最新的本地版本，而不需要发布到 npm。

##### 统一配置
TypeScript 配置：通过根目录的 tsconfig.json 统一管理所有包的 TypeScript 配置，并通过路径映射支持 @my-ui/* 别名。 
构建配置：使用 Rollup 进行组件库打包，在 rollup.config.js 中配置了构建规则。 
代码规范：通过 ESLint 和 Prettier 统一代码风格。

##### 开发优势
+ 代码复用：不同包之间可以轻松共享代码
+ 版本一致性：所有包可以在同一仓库中同步版本更新
+ 简化依赖管理：通过 workspace 协议直接链接本地包
+ 统一构建流程：可以通过根目录脚本统一构建所有包
+ 便于测试：示例应用可以直接使用本地最新版本的组件库

## 🚀 项目初始化
### 1. 创建项目并初始化
```bash
mkdir react-component-library && cd react-component-library
npm init -y
```

### 2. 安装核心依赖
```bash
# 开发依赖
pnpm add -D typescript @types/react @types/react-dom
pnpm add -D rollup @rollup/plugin-typescript @rollup/plugin-node-resolve
pnpm add -D @rollup/plugin-commonjs @rollup/plugin-babel rollup-plugin-dts
pnpm add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
pnpm add -D eslint-plugin-react eslint-plugin-react-hooks prettier
pnpm add -D @babel/core @babel/preset-env @babel/preset-react @babel/preset-typescript

# 生产依赖
pnpm add prop-types
pnpm add -P react react-dom
```

## ⚙️ 核心配置文件
### 1. Monorepo 配置 (pnpm-workspace.yaml)
```yaml
packages:
  - 'packages/*'
```

### 2. TypeScript 配置 (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "strict": true,
    "module": "ESNext",
    "moduleResolution": "node",
    "jsx": "react-jsx",
    "declaration": true,
    "outDir": "dist",
    "baseUrl": ".",
    "paths": {
      "@my-ui/*": ["packages/*/src"]
    }
  },
  "include": ["packages/*/src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 3. Rollup 打包配置 (输出为两种格式 ejs cjs)
```javascript
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import dts from 'rollup-plugin-dts';

export default [
  // JS构建，输出为两种格式 ejs cjs
  {
    input: 'packages/components/src/index.ts',
    external: ['react', 'react-dom', 'prop-types'],
    output: [
      {
        file: 'packages/components/dist/index.esm.js',
        format: 'esm',
        sourcemap: true,
      },
      {
        file: 'packages/components/dist/index.cjs.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
    ],
    plugins: [
      nodeResolve({ extensions: ['.js', '.jsx', '.ts', '.tsx'] }),
      commonjs(),
      typescript({ declaration: false }),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: [
          '@babel/preset-env',
          '@babel/preset-react',
          '@babel/preset-typescript',
        ],
      }),
    ],
  },
  // 类型声明构建
  {
    input: 'packages/components/src/index.ts',
    external: ['react', 'react-dom', 'prop-types'],
    output: { file: 'packages/components/dist/index.d.ts', format: 'esm' },
    plugins: [dts()],
  },
];
```

## 🎨 组件开发实践
### 1. 组件类型定义
```typescript
// packages/components/src/Toast/types.ts
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  type?: ToastType;
  duration?: number;
  closable?: boolean;
  onClose?: () => void;
}

export interface ToastProps extends ToastOptions {
  message: string;
  id: string;
  visible: boolean;
  onDestroy: (id: string) => void;
}
```

### 2. 组件实现（TypeScript + PropTypes 双重校验）
```tsx
// packages/components/src/Toast/Toast.tsx
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ToastProps, ToastType } from './types';

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ⓘ',
};

const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type = 'info',
  duration = 3000,
  visible,
  onClose,
  onDestroy,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setTimeout(() => setIsVisible(true), 50);
      if (duration > 0) {
        setTimeout(() => {
          setIsVisible(false);
          onClose?.();
          setTimeout(() => onDestroy(id), 300);
        }, duration);
      }
    }
  }, [visible, duration]);

  return (
    <div className={`toast toast-${type} ${isVisible ? 'toast-visible' : ''}`}>
      <span className={`toast-icon toast-icon-${type}`}>{ICONS[type]}</span>
      <div className="toast-content">{message}</div>
      <button onClick={() => setIsVisible(false)}>✕</button>
    </div>
  );
};

// PropTypes 运行时校验
Toast.propTypes = {
  id: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  duration: PropTypes.number,
  visible: PropTypes.bool.isRequired,
  onDestroy: PropTypes.func.isRequired,
};

export default Toast;
```

### 3. 全局管理器
```tsx
// packages/components/src/Toast/ToastManager.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import Toast from './Toast';
import { ToastOptions } from './types';

class ToastManager {
  private container: HTMLElement;
  private root: any;
  private toasts = new Map();

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
    this.root = createRoot(this.container);
  }

  show(message: string, options: ToastOptions = {}) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const toast = { id, message, visible: true, ...options };

    this.toasts.set(id, toast);
    this.render();
    return id;
  }

  success = (message: string, options?: Omit<ToastOptions, 'type'>) =>
    this.show(message, { ...options, type: 'success' });

  error = (message: string, options?: Omit<ToastOptions, 'type'>) =>
    this.show(message, { ...options, type: 'error' });

  private render() {
    const elements = Array.from(this.toasts.values()).map((toast) => (
      <Toast key={toast.id} {...toast} onDestroy={this.remove} />
    ));
    this.root.render(<>{elements}</>);
  }

  private remove = (id: string) => {
    this.toasts.delete(id);
    this.render();
  };
}

export const toast = new ToastManager();
```

### 4. 统一导出
```typescript
// packages/components/src/index.ts
export { default as Toast, toast } from './Toast';
export type { ToastType, ToastOptions, ToastProps } from './Toast';
export const version = '1.0.0';
```

## 📦 构建与发布
### 1. 构建脚本配置
```json
{
  "scripts": {
    "build": "rollup -c",
    "build:watch": "rollup -c -w",
    "lint": "eslint packages/ --ext .ts,.tsx",
    "format": "prettier --write packages/**/*.{ts,tsx}",
    "dev": "pnpm --filter example dev"
  }
}
```

### 2. 组件包配置
```json
// packages/components/package.json
{
  "name": "your-react-design",
  "main": "dist/index.cjs.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  }
}
```

### 3. 发布流程
```bash
# 1. 构建项目
pnpm build

# 2. 更新版本
cd packages/components && npm version patch

# 3. 发布到npm
npm publish
```

## 🛠️ 开发体验优化
### 1. 示例应用配置
```typescript
// packages/example/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@my-ui/components': resolve(__dirname, '../components/src'),
    },
  },
});
```

### 2. 代码规范
```javascript
// .eslintrc.js
module.exports = {
  extends: ['eslint:recommended', 'plugin:react/recommended'],
  parser: '@typescript-eslint/parser',
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'warn',
  },
};
```

## 🎉 总结
这个组件库的核心特点：

1. **双重校验**: TypeScript 编译时 + PropTypes 运行时
2. **现代化工具链**: pnpm + Rollup + ESLint + Prettier
3. **Monorepo 架构**: 多包管理，便于维护
4. **完整的开发体验**: 热更新、类型提示、代码规范
5. **可扩展性**: 易于添加新组件和功能

通过这套架构，可以快速搭建一个现代化、类型安全、开发体验良好的 React 组件库。



