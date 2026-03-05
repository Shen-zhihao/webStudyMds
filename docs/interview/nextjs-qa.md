---
title: "Next.js 常见问题"
sidebar_position: 2
---

# 如何结局水合问题
1. 客户端特有API在服务端被调用 服务端渲染时（如Next.js的 pages 或 app 目录的服务端组件）若直接使用 window 、 document 、 navigator 等仅客户端存在的API，会导致服务端渲染的HTML与客户端实际渲染结果不一致。例如：

```tsx
// 错误示例：在服务端渲染的组件中直接使用window
function ClientComponent() {
  // 服务端没有window对象，会导致渲染值为空，客户端水合时变为真实宽度
  const width = window.innerWidth; 
  return <div>{width}</div>;
}
```

```tsx
// 正确示例：客户端特有逻辑放在useEffect中
function ClientComponent() {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    setWidth(window.innerWidth); // 仅客户端执行
  }, []);
  return <div>{width}</div>;
}
```

2. 动态值（时间/随机数）在两端不一致 服务端和客户端渲染时若使用时间戳（ new Date() ）、随机数（ Math.random() ）等动态值，由于执行时机不同，会导致两端渲染结果不同。例如：

```tsx
// 错误示例：服务端和客户端生成的随机数不同
function RandomComponent() {
  const random = Math.random(); // 服务端和客户端生成的随机数不同
  return <div>{random}</div>;
}
```

```tsx
// 正确示例：服务端生成随机数并传递给客户端
export default async function Page() {
  const serverRandom = Math.random(); // 服务端生成
  return <ClientComponent random={serverRandom} />;
}

'use client';
function ClientComponent({ random }) {
  return <div>{random}</div>; // 两端使用相同值
}
```

3. 状态初始化差异 客户端组件的 useState 初始值若依赖服务端无法获取的值（如客户端缓存），会导致服务端渲染的初始状态与客户端水合后的状态不一致。例如：

```tsx
// 错误示例：初始值依赖客户端localStorage（服务端无法读取）
function StateComponent() {
  const [name] = useState(() => localStorage.getItem('name')); // 服务端localStorage为undefined
  return <div>{name}</div>;
}
```

```tsx
状态初始化避免客户端依赖 ： useState 的初始值应仅依赖服务端可获取的数据（如props）。
```

4. CSS-in-JS或样式不匹配 部分CSS-in-JS库（如styled-components）若未正确配置SSR，会导致服务端生成的类名与客户端水合时生成的类名不同，引发DOM属性不匹配。

```tsx
配置CSS-in-JS的SSR ：以styled-components为例，需在服务端使用 ServerStyleSheet 收集样式，并注入到HTML中，确保客户端水合时类名一致。
```

5. 第三方组件SSR支持问题 使用的第三方组件可能未正确处理SSR，导致服务端和客户端渲染结果不一致（如动态加载的图表库、地图组件等）。

```tsx
import dynamic from 'next/dynamic';
const ThirdPartyComponent = dynamic(() => import('./ThirdPartyComponent'), { ssr: false });
```

# 在使用antd组件库以后nextjs出现客户端组件FOUC怎么解决
```typescript
// https://ant-design.antgroup.com/docs/react/use-with-next-cn
1、安装 @ant-design/nextjs-registry
  npm install @ant-design/nextjs-registry --save
2、在 app/layout.tsx 中使用
  import React from 'react';
  import { AntdRegistry } from '@ant-design/nextjs-registry';
  
  const RootLayout = ({ children }: React.PropsWithChildren) => (
    <html lang="en">
      <body>
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );

  export default RootLayout;
```

# `App Router`（应用路由）和 `Page Router`（页面路由）
### 📂**文件结构与路由定义**
| **特性** | **App Router** (app目录) | **Page Router** (pages目录) |
| :---: | :---: | :---: |
| **路由映射规则** | 文件夹路径即路由路径（如 `app/user/page.js` → `/user`） | 文件路径即路由路径（如 `pages/user.js`→ `/user`） |
| **特殊文件** | `page.js`（页面）、`layout.js`（布局）、`loading.js`（加载状态）等 | 无特殊文件约定，需手动配置全局布局（如 `_app.js`） |
| **动态路由** | 文件夹名用 `[param]`表示（如 `app/blog/[id]/page.js`） | 文件名用 `[param].js`表示（如 `pages/blog/[id].js`） |
| **嵌套路由** | 天然支持（通过子文件夹的 `layout.js`包裹 `page.js`） | 需手动配置嵌套路由（如 `pages/dashboard/index.js`和 `pages/dashboard/settings.js`） |


---

### ⚙️ **渲染机制与性能优化**
| **特性** | **App Router** | **Page Router** |
| :---: | :---: | :---: |
| **默认渲染方式** | 基于 **React Server Components (RSC)**，服务端组件优先 | 依赖传统 SSR/SSG（如 `getServerSideProps`<br/>/`getStaticProps`<br/>） |
| **数据获取** | 直接在组件中使用 `async/await`<br/> 获取数据（服务端组件） | 需通过特定函数（如 `getServerSideProps`<br/>）在页面级获取数据 |
| **流式渲染** | ✅ 支持逐步渲染（如 `loading.js`<br/> 自动集成 Suspense） | ❌ 不支持流式渲染 |
| **客户端组件** | 需显式添加 `"use client"`<br/> 指令 | 所有组件默认可在客户端运行 |


---

### 🧩 **功能特性对比**
| **特性** | **App Router** | **Page Router** |
| :---: | :---: | :---: |
| **布局管理** | 支持嵌套布局（`layout.js`可继承父级布局） | 仅全局布局（通过 `_app.js`包裹） |
| **错误处理** | 内置 `error.js`（错误边界）和 `not-found.js`（404） | 需手动配置 `_error.js` |
| **API 路由** | 与页面路由同级（如 `app/api/route.js`） | 独立目录（`pages/api/*.js`） |
| **高级路由功能** | 支持平行路由（`@folder`）、拦截路由（`(..)`）和路由组（`(group)`） | 仅基础路由 |


---

### ⚠️ ** 兼容性与开发体验**
| **特性** | **App Router** | **Page Router** |
| :---: | :---: | :---: |
| **Next.js 版本** | 需 ≥13.4（推荐 ≥14.x） | 支持旧版（≤12.x），新版兼容但非默认 |
| **第三方库支持** | ❗ 部分库适配不足（如早期 Redux、i18n） | ✅ 社区生态成熟，兼容性更好 |
| **学习曲线** | 较高（需理解 RSC、服务端操作等新概念） | 较低（更接近传统 React 开发） |
| **官方支持** | ✅ 未来主力方向（持续更新新特性） | ⚠️ 维护逐渐减少 |


### 两者主要区别：
+ 服务器组件: App Router默认使用React服务器组件，而Pages Router使用客户端组件
+ 布局系统: App Router提供了更强大的嵌套布局系统，Pages Router需要使用自定义\_app.js
+ 数据获取: App Router允许在组件中直接使用async/await，Pages Router使用getServerSideProps等函数
+ 文件约定: App Router使用page.js表示路由，Pages Router使用index.js或命名文件
+ 路由分组: App Router支持路由组、平行路由和拦截路由等高级功能

### 💎 **总结：如何选择？**
1. **选**** **`**App Router**`** ****的场景**：
    - 新项目启动，需流式渲染、SEO 深度优化或复杂布局嵌套；
    - 追求性能提升（如减少客户端 JS 体积）；
    - 愿意接受新概念（如 Server Components）。
2. **选**** **`**Page Router**`** ****的场景**：
    - 维护旧项目或依赖大量未适配 App Router 的第三方库；
    - 需要快速开发且无需高级路由功能；
    - 团队熟悉传统 SSR/SSG 模式。

# 'use client'意味着什么
当一个标记为'use server'的服务器组件下嵌套了多个标记为'use client'的客户端组件时，这些客户端组件的内容会在服务器返回的初始HTML文档中展示。

这是因为：

1. 服务器渲染过程：服务器组件及其所有子组件(包括客户端组件)都会在服务器上进行初始渲染，生成HTML。



2. 客户端组件的特殊处理：对于标记了'use client'的组件，Next.js会：
+ 在服务器上渲染其初始HTML
+ 将组件的JavaScript代码分离出来，作为单独的客户端bundle
+ 在HTML中插入必要的标记，以便客户端水合



3. 水合(Hydration)过程：当HTML加载到浏览器后，React会"水合"这些客户端组件，使它们变为可交互状态。这个过程会：
+ 加载客户端组件的JavaScript
+ 将事件监听器附加到已渲染的HTML元素上
+ 建立组件状态和生命周期



因此，'use client'指令并不意味着组件仅在客户端渲染，而是表示该组件需要在客户端进行水合和交互处理。

# 服务端组件有哪些特性和限制
+ 服务端组件在服务器上渲染，不发送JavaScript到客户端。适用于不需要客户端交互的UI部分，可以显著减少JavaScript包大小，可以直接连接数据库、文件系统或其他后端服务，无需中间API层，内容在服务器端渲染，搜索引擎可以更好地索引页面内容。
+ 服务端组件不能使用React Hooks、浏览器API、事件处理器。不能响应客户端组件的状态变化，从服务端组件传递给客户端组件的props必须是可序列化的（不能是函数或类实例）。

# 当使用了Server Components我们经常能见到带着rsc的请求在浏览器上，这是什么
+ 当我们在浏览器开发工具的网络面板中看到带有"rsc"的请求时，这些是React Server Components (RSC)的数据流请求。"rsc"代表"React Server Components"，这是Next.js和React的服务器组件架构的核心部分。
+ 这些请求的存在是Next.js的App Router架构工作方式的直接结果。在这种架构中，服务器组件在服务器上渲染，然后将结果发送到客户端，而客户端组件则在浏览器中渲染。这种混合渲染模式需要客户端和服务器之间的通信机制，这就是我们看到的RSC请求。这些请求的工作原理如下：
1. **RSC Payload**: 这些请求返回的是一种特殊格式的数据，称为RSC Payload（服务器组件负载）。它包含了服务器组件的渲染结果，以一种React客户端可以理解和处理的格式。
2. **流式传输**: 这些请求通常使用HTTP流（Stream）传输数据，允许浏览器逐步接收和处理服务器组件的渲染结果，而不必等待整个响应完成。
3. **客户端-服务器边界**: 当客户端组件需要渲染服务器组件的子组件时，这些RSC请求会被触发，建立客户端和服务器之间的通信桥梁。
4. **导航和重新渲染**: 当用户在应用中导航或触发需要新服务器组件的操作时，浏览器会发出新的RSC请求来获取更新的组件数据。

# nextjs项目如何解决页面跳转时候的权限问题
```javascript
// middleware.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function middleware(request: NextRequest) {
  const token = cookies().get('auth_token')?.value;
  const protectedPaths = ['/dashboard', '/admin'];
  const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 可扩展：解析 JWT 验证用户角色
  const userRole = token ? parseUserRole(token) : null;
  if (request.nextUrl.pathname.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/forbidden', request.url));
  }

  return NextResponse.next();
}
```

```javascript
// app/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { getUserFromCookie } from '@/lib/auth';

export default async function Dashboard() {
  const user = await getUserFromCookie();
  if (!user) redirect('/login'); // 服务端重定向，避免页面渲染
  return <DashboardContent user={user} />;
}
```

```javascript
// components/AuthGuard.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';

export const AuthGuard = ({ children, requiredRole }: { requiredRole?: string }) => {
  const router = useRouter();
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (requiredRole && user.role !== requiredRole) {
      router.push('/403');
    }
  }, [user, router]);

  return user ? children : null;
};

// 使用
// app/dashboard/settings/page.tsx
import { AuthGuard } from '@/components/AuthGuard';

export default function SettingsPage() {
  return (
    <AuthGuard requiredRole="user">
      <SettingsContent />
    </AuthGuard>
  );
}
```

# 结合 `getStaticProps` 和动态路由实现页面静态生成
```javascript
pages/
  └── product/
        └── [id].tsx  // 动态路由页面
```

```typescript
import { GetStaticPaths, GetStaticProps } from 'next';

// 1. 定义商品数据类型
type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
};

// 2. 页面组件接收商品数据
export default function ProductDetailPage({ product }: { product: Product }) {
  return (
    <div>
      <h1>{product.name}</h1>
      <img src={product.imageUrl} alt={product.name} />
      <p>{product.description}</p>
      <p>价格: ¥{product.price.toFixed(2)}</p>
    </div>
  );
}

// 3. 获取所有商品ID路径（构建时生成）
export const getStaticPaths: GetStaticPaths = async () => {
  // 模拟API请求获取所有商品ID
  const res = await fetch('https://api.example.com/products');
  const products: Product[] = await res.json();

  // 生成预渲染路径
  const paths = products.map(product => ({
    params: { id: product.id }  // 动态参数必须匹配 [id]
  }));

  return {
    paths,
    fallback: 'blocking'  // 处理未预渲染的路径[8,9](@ref)
  };
};

// 4. 根据ID获取单个商品数据
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const id = params?.id as string;
  
  try {
    // 请求商品详情API
    const res = await fetch(`https://api.example.com/products/${id}`);
    
    // 处理不存在商品[8](@ref)
    if (res.status === 404) {
      return { notFound: true };  // 自动显示404页面
    }

    const product: Product = await res.json();
    
    return {
      props: { product },
      revalidate: 60  // ISR: 每60秒最多更新一次[5,10](@ref)
    };
  } catch (error) {
    return { notFound: true };
  }
};
```

# ssr后端失效，如何切换为前端渲染
当 SSR（服务端渲染）后端失效时，通过预设的降级机制切换到 CSR（客户端渲染）是保障页面可用的核心方案。以下是具体实现策略和技术细节：

---

### ⚙️ 一、降级机制的核心原理
SSR 降级的核心是 **动态切换渲染模式**：在构建阶段同时生成 SSR 完整页面模板（`index.ssr.html`）和 CSR 空壳模板（`index.csr.html`），由 Node 服务层根据运行时状态决定返回哪种模板。降级触发条件包括：

1. **服务端异常**：渲染超时、未捕获错误或服务器宕机；
2. **手动开关**：通过 URL 参数（如 `?_csr=true`）或配置中心强制降级；
3. **资源过载**：CPU/内存超阈值或请求错误率激增。

---

### 🔧 二、关键实现步骤
#### 1. 构建双模模板
+ **SSR 模板**（`index.ssr.html`）：包含服务端渲染的完整 HTML 结构。
+ **CSR 模板**（`index.csr.html`）：仅保留根容器（如 `<div id="app"></div>`）和客户端脚本引用。
+ **构建工具配置**：通过 Webpack/Vite 分别打包 Server Bundle（服务端逻辑）和 Client Bundle（客户端逻辑）。

#### 2. Node 服务层降级逻辑
在 Express/Koa 中间件中实现降级判断：

```javascript
// server.js 示例
app.get('*', async (req, res) => {
  // 条件1: 手动降级开关（URL 参数）
  if (req.query._csr === 'true') {
    return res.send(csrTemplate); // 返回 CSR 模板
  }
// 条件2: 配置中心强制降级
  const config = getConfigFromSomewhere();
  if (config.forceCSR) {
    return res.send(csrTemplate);
  }
try {
    // 条件3: 渲染超时或异常（自动降级）
    const html = await Promise.race([
      renderer.renderToString(context),
      timeoutPromise(2000) // 2秒超时
    ]);
    res.send(html);
  } catch (err) {
    console.error('SSR failed, degrading to CSR:', err);
    res.send(csrTemplate); // 异常时降级
  }
});
```

**关键点**： 

+ 超时时间建议设置为 1.5~3 秒，避免用户长时间等待；
+ 降级时需上报错误日志至监控系统（如 Sentry）。

#### 3. 客户端激活兼容
无论返回 SSR 或 CSR 模板，客户端入口文件（`entry-client.js`）均通过 `app.$mount('#app')` 挂载，确保无缝接管。

---

### 🛡️ 三、配套保障措施
#### 1. 监控与告警
+ **服务层监控**：APM 工具（如 Datadog）跟踪 SSR 响应时间、错误率及服务器资源 usage。
+ **前端监控**：捕获 Hydration mismatch 错误（如前后端渲染结果不一致）。

#### 2. 缓存与高可用
+ **页面级缓存**：对静态页面（如商品详情）缓存 SSR 结果（Redis/LRU）。
+ **CDN 回源降级**：当 Node 服务不可用时，CDN 可直接返回预渲染的 CSR 模板。
+ **多实例部署**：Node 服务无状态化，通过 Nginx 负载均衡避免单点故障。

#### 3. 降级演练
+ **定期测试**：手动触发降级配置，验证 CSR 链路可用性。
+ **用户体验优化**：降级后显示 Loading 骨架屏，避免白屏焦虑。

---

### ⚠️ 四、常见问题与避坑
1. **Hydration 失败** 
    - **原因**：SSR 与 CSR 渲染结果不一致（如使用 `Date.now()` 或依赖 `window` 对象）。
    - **解决方案**： 
        * 动态内容在 `useEffect` 中更新（React）或 `mounted` 钩子（Vue）；
        * 标记仅客户端组件（如 Next.js 的 `dynamic(import, { ssr: false })`）。
2. **接口重复请求** 
    - **问题**：SSR 和 CSR 阶段重复调用同一接口。
    - **修复**：SSR 将数据注入 `window.__INITIAL_DATA__`，CSR 直接读取。
3. **预渲染替代方案** 
    - 若数据无需实时性（如营销页），构建时预渲染（Prerendering）可避免服务端依赖。

---

### 💎 总结
SSR 降级 CSR 的本质是 **容错设计**，通过双模构建、运行时监控和自动化切换保障页面可用性。生产环境需结合缓存、多实例部署及定期演练，确保降级机制可靠生效。若需完整代码示例，可参考 UmiJS 或 Vite 的 SSR 实践。

