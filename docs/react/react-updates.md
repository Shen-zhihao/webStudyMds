---
title: "React 历代主要更新"
sidebar_position: 5
---

# React 16更新
React Fiber是16版本之后的一种更新机制，使用链表取代了树，是一种fiber数据结构，其有三个指针，分别指向了父节点、子节点、兄弟节点，当中断的时候会记录下当前的节点，然后继续更新，而15版本中的DOM stack不能有中断操作，它把组件渲染的工作分片，到时会主动让出渲染主线程；提炼fiber的关键词，大概给出如下几点：

fiber是一种数据结构。

fiber使用父子关系以及next的妙用，以链表形式模拟了传统调用栈。

fiber是一种调度让出机制，只在有剩余时间的情况下运行。

fiber实现了增量渲染，在浏览器允许的情况下一点点拼凑出最终渲染效果。

fiber实现了并发，为任务赋予不同优先级，保证了一有时间总是做最高优先级的事，而不是先来先占位死板的去执行。

fiber有协调与提交两个阶段，协调包含了fiber创建与diff更新，此过程可暂停。而提交必须同步执行，保证渲染不卡顿。

# React 17更新
### 1、新的JSX转换，不需要手动引入react
**React 16：**

babel-loader会预编译JSX为 **React.createElement(...)**

**React 17：**

React 17中的 JSX 转换不会将 JSX 转换为 **React.createElement**，而是自动从 React 的 package 中引入react并调用。

另外此次升级不会改变 JSX 语法，旧的 JSX 转换也将继续工作。

### 2、事件代理更改
在React 17中，将不再在后台的文档级别附加事件处理程序，不在document对象上绑定事件，改为绑定于每个react应用的rootNode节点，因为各个应用的rootNode肯定不同，所以这样可以使多个版本的react应用同时安全的存在于页面中，不会因为事件绑定系统起冲突。react应用之间也可以安全的进行嵌套。

### 3、事件池(event pooling)的改变
React 17去除了事件池(event pooling)，不在需要e.persist()，现在可以直接在异步事件中（回掉或timeout等）拿到事件对象，操作更加直观，不会令人迷惑。e.persist()仍然可用，但是不会有任何效果。

### 4、异步执行
React 17将副作用清理函数(useEffect)改为异步执行，即在浏览器渲染完毕后执行。

### 5、forwardRef 和 memo组件的行为
React 17中forwardRef 和 memo组件的行为会与常规函数组件和class组件保持一致。它们在返回undefined时会报错。

# React 18更新
### 并发模式
v18的新特性是使用现代浏览器的特性构建的，彻底放弃对 IE 的支持。

v17 和 v18 的区别就是：从同步不可中断更新变成了异步可中断更新，v17可以通过一些试验性的API开启并发模式，而v18则全面开启并发模式。

并发模式可帮助应用保持响应，并根据用户的设备性能和网速进行适当的调整，该模式通过使渲染可中断来修复阻塞渲染限制。在 Concurrent 模式中，React 可以同时更新多个状态。

这里参考下文区分几个概念：

+ **并发模式**是实现**并发更新**的基本前提
+ v18 中，以是否使用**并发特性**作为是否开启**并发更新**的依据。
+ **并发特性**指开启**并发模式**后才能使用的特性，比如：useDeferredValue/useTransition

### 更新 render API
v18 使用 ReactDOM.createRoot() 创建一个新的根元素进行渲染，使用该 API，会自动启用并发模式。如果你升级到v18，但没有使用ReactDOM.createRoot()代替ReactDOM.render()时，控制台会打印错误日志要提醒你使用React，该警告也意味此项变更没有造成breaking change，而可以并存，当然尽量是不建议。

```javascript
// v17
import ReactDOM from 'react-dom'
import App from './App'

ReactDOM.render(<App />, document.getElementById('root'))

// v18
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />)
```

### 自动批处理
批处理是指 React 将多个状态更新，聚合到一次 render 中执行，以提升性能

在v17的批处理只会在事件处理函数中实现，而在Promise链、异步代码、原生事件处理函数中失效。而v18则所有的更新都会自动进行批处理。

```javascript
// v17
const handleBatching = () => {
  // re-render 一次，这就是批处理的作用
  setCount((c) => c + 1)
  setFlag((f) => !f)
}

// re-render两次
setTimeout(() => {
   setCount((c) => c + 1)
   setFlag((f) => !f)
}, 0)


// v18
const handleBatching = () => {
  // re-render 一次
  setCount((c) => c + 1)
  setFlag((f) => !f)
}
// 自动批处理：re-render 一次
setTimeout(() => {
   setCount((c) => c + 1)
   setFlag((f) => !f)
}, 0)

```

如果在某些场景不想使用批处理，可以使用 flushSync退出批处理，强制同步执行更新。

flushSync 会以函数为作用域，函数内部的多个 setState 仍然是批量更新：

```javascript
const handleAutoBatching = () => {
  // 退出批处理
  flushSync(() => {
    setCount((c) => c + 1)
  })
  flushSync(() => {
    setFlag((f) => !f)
  })
}
```

### Suspense 支持 SSR
SSR 一次页面渲染的流程：

1. 服务器获取页面所需数据
2. 将组件渲染成 HTML 形式作为响应返回
3. 客户端加载资源
4. （hydrate）执行 JS，并生成页面最终内容

上述流程是串行执行的，v18前的 SSR 有一个问题就是它不允许组件"等待数据"，必须收集好所有的数据，才能开始向客户端发送HTML。如果其中有一步比较慢，都会影响整体的渲染速度。

v18 中使用并发渲染特性扩展了Suspense的功能，使其支持流式 SSR，将 React 组件分解成更小的块，允许服务端一点一点返回页面，尽早发送 HTML和选择性的 hydrate， 从而可以使SSR更快的加载页面：

```javascript
<Suspense fallback={<Spinner />}>
  <Comments />
</Suspense>
```

### startTransition
Transitions 是 React 18 引入的一个全新的并发特性。它允许你将标记更新作为一个 transitions（过渡），这会告诉 React 它们可以被中断执行，并避免回到已经可见内容的 Suspense 降级方案。本质上是用于一些不是很急迫的更新上，用来进行并发控制

在v18之前，所有的更新任务都被视为急迫的任务，而Concurrent Mode 模式能将渲染中断，可以让高优先级的任务先更新渲染。

React 的状态更新可以分为两类：

+ 紧急更新：比如点击按钮、搜索框打字是需要立即响应的行为，如果没有立即响应给用户的体验就是感觉卡顿延迟
+ 过渡/非紧急更新：将 UI 从一个视图过渡到另一个视图。一些延迟可以接受的更新操作，不需要立即响应

startTransition API 允许将更新标记为非紧急事件处理，被startTransition包裹的会延迟更新的state，期间可能被其他紧急渲染所抢占。因为 React 会在高优先级更新渲染完成之后，才会渲染低优先级任务的更新

React 无法自动识别哪些更新是优先级更高的。比如用户的键盘输入操作后，setInputValue会立即更新用户的输入到界面上，是紧急更新。而setSearchQuery是根据用户输入，查询相应的内容，是非紧急的。

```javascript
const [inputValue, setInputValue] = useState()

const onChange = (e)=>{
  setInputValue(e.target.value) // 更新用户输入值（用户打字交互的优先级应该要更高）
  setSearchQuery(e.target.value)  // 更新搜索列表（可能有点延迟，影响）
}

return (
  <input value={inputValue} onChange={onChange} />
)
```

React无法自动识别，所以它提供了 startTransition让我们手动指定哪些更新是紧急的，哪些是非紧急的，从而让我们改善用户交互体验。

```javascript
// 紧急的更新
setInputValue(e.target.value)
// 开启并发更新
startTransition(() => {
  setSearchQuery(input) // 非紧急的更新
})
```

### 新增 Hooks
#### useTransition
当有过渡任务（非紧急更新）时，我们可能需要告诉用户什么时候当前处于 pending（过渡） 状态，因此v18提供了一个带有isPending标志的 Hook useTransition来跟踪 transition 状态，用于过渡期。

useTransition 执行返回一个数组。数组有两个状态值：

+ isPending: 指处于过渡状态，正在加载中
+ startTransition: 通过回调函数将状态更新包装起来告诉 React这是一个过渡任务，是一个低优先级的更新

```javascript
function TransitionTest() {
  const [isPending, startTransition] = useTransition()
  const [count, setCount] = useState(0)

  function handleClick() {
    startTransition(() => {
      setCount((c) => c + 1)
    })
  }

  return (
    <div>
      {isPending && <div>spinner...</div>}
      <button onClick={handleClick}>{count}</button>
    </div>
  )
}
```

直观感觉这有点像 setTimeout，而防抖节流其实本质也是setTimeout，区别是防抖节流是控制了执行频率，让渲染次数减少了，而 v18的 transition 则没有减少渲染的次数。

#### useDeferredValue
useDeferredValue 和 useTransition 一样，都是标记了一次非紧急更新。useTransition是处理一段逻辑，而useDeferredValue是产生一个新状态，它是延时状态，这个新的状态则叫 DeferredValue。所以使用useDeferredValue可以推迟状态的渲染

useDeferredValue 接受一个值，并返回该值的新副本，该副本将推迟到紧急更新之后。如果当前渲染是一个紧急更新的结果，比如用户输入，React 将返回之前的值，然后在紧急渲染完成后渲染新的值。

```javascript
function Typeahead() {
  const query = useSearchQuery('');
  const deferredQuery = useDeferredValue(query);

  // Memoizing 告诉 React 仅当 deferredQuery 改变，
  // 而不是 query 改变的时候才重新渲染
  const suggestions = useMemo(() =>
    <SearchSuggestions query={deferredQuery} />,
    [deferredQuery]
  );

  return (
    <>
      <SearchInput query={query} />
      <Suspense fallback="Loading results...">
        {suggestions}
      </Suspense>
    </>
  );
}
```

这样一看，useDeferredValue直观就是延迟显示状态，那用防抖节流有什么区别呢？

如果使用防抖节流，比如延迟300ms显示则意味着所有用户都要延时，在渲染内容较少、用户CPU性能较好的情况下也是会延迟300ms，而且你要根据实际情况来调整延迟的合适值；但是useDeferredValue是否延迟取决于计算机的性能。

#### useId
useId支持同一个组件在客户端和服务端生成相同的唯一的 ID，避免 hydration 的不匹配，原理就是每个 id 代表该组件在组件树中的层级结构：

```javascript
function Checkbox() {
  const id = useId()
  return (
    <>
      <label htmlFor={id}>Do you like React?</label>
      <input id={id} type="checkbox" name="react" />
    </>
  )
}
```

#### useInsertionEffect
与 useLayoutEffect 类似，但在所有 DOM 变化之前同步运行，适用于 CSS-in-JS 库

### 提供给第三方库的 Hook
#### useSyncExternalStore
useSyncExternalStore 一般是第三方状态管理库使用如 Redux。它通过强制的同步状态更新，使得外部 store 可以支持并发读取。它实现了对外部数据源订阅时不再需要 useEffect：

```javascript
const state = useSyncExternalStore(subscribe, getSnapshot[, getServerSnapshot]);
```

#### useInsertionEffect
useInsertionEffect 仅限于 css-in-js 库使用。它允许 css-in-js 库解决在渲染中注入样式的性能问题。 执行时机在 useLayoutEffect 之前，只是此时不能使用ref和调度更新，一般用于提前注入样式：

```javascript
useInsertionEffect(() => {
    console.log('useInsertionEffect 执行')
}, [])
```

# React 19更新
### Server Components 的稳定支持
Server Components 提供了一种全新的组件渲染模式，在服务器上提前渲染，减少了客户端的渲染负担。React 19 将此功能推向稳定，并引入了相关的 API 和最佳实践。

+ 支持在构建时或请求时生成组件。
+ 无需引入额外的工具链，即可与现有 React 项目集成。

### 原生支持 Document Metadata
React 19 原生支持 <title>、<meta> 和 <link> 等文档元数据标签。这些标签可直接在组件中声明，React 会自动将它们提升至 <head>，并确保与服务端渲染和客户端渲染兼容。

这样可以直接 简化 SEO 和元数据管理逻辑，并且不需要像以前一样手动插入标签了

```javascript
function BlogPost({ post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <title>{post.title}</title>
      <meta name="author" content={post.author} />
    </article>
  );
}
```

### 新增 Hooks
#### useOptimistic
用于管理乐观更新。当执行某个操作时，可以先假设操作成功，并立即更新 UI，然后在操作完成后根据实际结果调整状态。比如点赞、评论、加入购物车等功能，我们都可以先假设成功，再根据接口返回来调整。

#### useActionState
用于管理与用户操作相关的状态。它能够记录和回放用户操作，帮助实现更复杂的交互和调试功能。

```javascript
function ChangeName({ currentName }) {
  const [error, submitAction, isPending] = useActionState(async (prev, formData) => {
    const error = await updateName(formData.get("name"));
    if (error) return error;
    return null;
  });

  return (
    <form action={submitAction}>
    <input type="text" name="name" defaultValue={currentName} />
    <button type="submit" disabled={isPending}>Update</button>
  {error && <p>{error}</p>}
    </form>
   );
  }
```

### use API
React 19 引入了全新的 use API，用于在渲染期间读取资源。

例如：读取 Promise 或 Context。这种模式允许条件调用，并与 Suspense 结合使用。

+ 支持条件调用：突破了传统 Hooks 的调用限制。
+ 与 Suspense 深度集成：自动管理异步状态，简化异步渲染逻辑。

```javascript
import { use } from 'react';

function Comments({ commentsPromise }) {
  const comments = use(commentsPromise);
  return comments.map(comment => <p key={comment.id}>{comment}</p>);
}
```

### ref 写法更新
```javascript
import React, { forwardRef, useImperativeHandle } from 'react';

// 子组件（函数组件）
const ChildComponent = forwardRef((props, ref) => {

  // 子组件内部的方法
  const handleClick = () => {
    console.log('Clicked in ChildComponent');
  };

  // 使用 useImperativeHandle 将方法暴露给父组件
  useImperativeHandle(ref, () => ({
    // 返回需要父组件访问的接口
    handleClick,
  }),[]);

  return (
   <button onClick={handleClick}>Click me</button>
  );
});
```

```javascript
import React, { useImperativeHandle } from 'react';

// 子组件（函数组件）
const ChildComponent = (({ref,...props}) => {

  // 子组件内部的方法
  const handleClick = () => {
    console.log('Clicked in ChildComponent');
  };

  // 使用 useImperativeHandle 将方法暴露给父组件
  useImperativeHandle(ref, () => ({
    // 返回需要父组件访问的接口
    handleClick,
  }),[]);

  return (
   <button onClick={handleClick}>Click me</button>
  );
});
```

### ref 回调的清理功能
React 19 为 ref 回调增加了清理函数支持，允许在组件卸载时自动执行清理逻辑：

```javascript
<input ref={(ref) => {
  // ref 创建时的逻辑
  return () => {
    // ref 清理时的逻辑
  };
}} />
```

### 支持 <Context> 简写
React 19 引入了更简洁的 Context 写法，现在可以直接使用 <Context> 代替 <Context.Provider>

```javascript
const ThemeContext = createContext('');
function App({children}) {
  return <ThemeContext value="dark">{children}</ThemeContext>;
}
```

# React 18 到 React 19 更新：
## 🚀 核心技术差异
| **特性** | **React 18** | **React 19（2025年底状态）** |
| :---: | :---: | :---: |
| **发布状态** | 稳定成熟（2022年3月发布） | 稳定版（2024年4月发布），生态逐步完善 |
| **渲染API** | 支持Legacy API (`ReactDOM.render`) | **彻底移除Legacy API**，强制使用`createRoot` |
| **性能优化** | 手动优化（`React.memo`/`useMemo`） | **React Compiler自动优化**（减少70%+样板代码） |
| **表单处理** | 事件处理器+手动防抖 | **Actions API** + 服务器绑定表单操作 |
| **服务器组件** | 实验性（需框架支持） | **生产级稳定**，Next.js 15+深度集成 |
| **异步上下文** | 有限支持 | `**use()**`**钩子**提供异步安全上下文 |
| **资源加载** | 手动`<link>`预加载 | **智能协调加载**（减少FOUC） |
| **Suspense行为** | 并行加载兄弟组件 | **串行加载**（需注意性能影响） |
| **包体积** | ～46KB (gzip) | ～59KB (gzip，+27%) |


---

## 🔧 关键API变更（2025年实测）
### 1. **渲染方式强制升级**
```javascript
// React 18（已废弃）
ReactDOM.render(<App />, document.getElementById('root'));

// React 19（唯一方式）
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

### 2. **表单操作革命**
```javascript
// React 18：繁琐的客户端处理
function CommentForm() {
  const [text, setText] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/comment', { method: 'POST', body: JSON.stringify({ text }) });
  };
  return <form onSubmit={handleSubmit}>...</form>;
}
// React 19：简洁的服务器绑定
function CommentForm() {
  async function postComment(formData) {
    'use server'; // 标记为服务器函数
    await db.comments.create(Object.fromEntries(formData));
  }
  return (
    <form action={postComment}>
      <input name="text" />
      <button type="submit">提交</button>
    </form>
  );
}

```

### 3. **新增核心Hook**
+ `use()`：安全读取Promise/Context（异步边界）
+ `useActionState`：简化表单状态管理
+ `useOptimistic`：乐观更新UI
+ `useFormStatus`：表单提交状态追踪

---

