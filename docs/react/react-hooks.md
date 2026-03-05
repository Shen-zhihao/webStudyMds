---
title: "React Hooks"
sidebar_position: 2
---

# 核心原则
```javascript
基于规则的工作机制：React 通过一套严格的规则来管理 Hooks 的使用，例如必须在函数组件顶层调用 Hook，不能在循环、条件或嵌套函数中调用。

组件状态与生命周期的函数化：Hooks 将组件状态和生命周期行为抽象为独立的、可复用的函数，使复杂逻辑易于管理和测试。

对函数式编程思想的运用：Hooks 通过纯函数和闭包来处理状态和副作用，鼓励使用不可变数据和函数组合，提升代码的可预测性和简洁性。
```

# 实现原理
##### useState实现原理
```javascript
状态存储：在实际的 React 实现中，状态并不存储在全局变量或数组中。每个组件实例都有自己的内部状态对象，用于存储通过 useState 创建的所有状态变量。
        当调用 useState(initialState) 时，React 会在组件内部的状态对象中为该状态分配一个唯一的键，并将其初始值设置为 initialState。

状态更新：setCount 函数是用于更新状态的回调。当调用 setCount(newState) 时，React 不会立即修改现有状态，而是安排一次组件的重新渲染。
        在下一次渲染过程中，useState 将返回新的状态值，从而在组件树中传播变更。

闭包与记忆化：useState 返回的 [count, setCount] 数组利用了 JavaScript 的闭包特性，使得 setCount 可以访问到先前渲染周期中创建的 count 值。
           这确保了即使在异步操作中调用 setCount，也能正确地基于旧状态计算新状态。

const state = [];
let stateIndex = 0;
function useState(initialState) {
  const currentIndex = stateIndex; 
  stateIndex++;
  state[currentIndex] = state[currentIndex] || initialState; 
  function setState(newState) {
    state[currentIndex] = newState; //这里用到了闭包
    render();
  }
  return [state[currentIndex], setState]; 
}

function render() {
 stateIndex = 0;
  // 重新渲染组件
  // ...
}
```

##### useEffect实现原理
```javascript
调度与执行：useEffect 接收一个函数作为参数（即“effect 函数”），React 会在每次组件渲染后（包括首次渲染）调用 useEffect，并将 effect 函数放入一个任务队列中。当浏览器完成当前帧的所有 DOM 更新后，React 会执行这些 effect 函数。这样可以确保 effect 在视觉更新之后运行，避免阻塞渲染。

依赖数组与优化：useEffect 的第二个参数（可选）是一个依赖数组，用于指定 effect 所依赖的外部值。当这些依赖值在两次渲染之间发生变化时，React 会清理前一次 effect，并在下一次渲染后重新运行 effect 函数。如果省略此参数，effect 在每次渲染后都会执行。

清理机制：effect 函数可以返回一个清理函数。当 React 需要清理 effect（如依赖变化或组件卸载时），它会调用这个返回的函数。这样可以确保资源得到释放，避免内存泄漏。

let effectIndex = 0; // 用于跟踪每个 effect 的索引
const effectDependencies = []; // 用于存储每个 effect 的依赖项
const effectCleanups = []; // 用于存储每个 effect 的清理函数

function useCustomEffect(callback, dependencies) {
    const currentIndex = effectIndex; // 当前 useEffect 的索引
    const previousDependencies = effectDependencies[currentIndex];

    const hasChanged = !previousDependencies || dependencies.some((dep, i) => dep !== previousDependencies[i]);

    if (hasChanged) {
        if (effectCleanups[currentIndex]) {
            effectCleanups[currentIndex](); // 执行上一次的清理函数
        }
        const cleanup = callback();
        effectCleanups[currentIndex] = typeof cleanup === 'function' ? cleanup : null;
        effectDependencies[currentIndex] = dependencies;
    }

    effectIndex++;
}

// render的时候重置effectIndex
function render() {
  effectIndex = 0;
  // 重新渲染组件
  // ...
}

// 在组件卸载时执行所有清理函数
function cleanupAllEffects() {
    effectCleanups.forEach(cleanup => {
        if (cleanup) cleanup();
    });
}
```

##### useRef实现原理
```javascript
useRef 在 React 中用于创建一个可变的对象，该对象在组件的整个生命周期内保持一致。它通常用于存储对 DOM 元素或其他任意值的引用，而不会触发组件重新渲染。

let refStore = []; // 存储所有 useRef 创建的引用
let refIndex = 0;  // 跟踪当前 useRef 的索引

function useRef(initialValue) {
    const currentIndex = refIndex; // 当前 useRef 的索引

    if (!refStore[currentIndex]) { //只有不存在的时候才需要初始化
        refStore[currentIndex] = { current: initialValue }; // 初始化引用对象
    }

    refIndex++; // 增加索引以支持多个 useRef

    return refStore[currentIndex]; // 返回引用对象
}

function render() {
  refIndex = 0;
  // 重新渲染组件
  // ...
}
```

##### useMemo实现原理
```javascript
useEffect、useMemo、useCallback 这三个其实很像，它们都依赖于依赖数组来决定何时执行。区别在于：

useEffect：		依赖变化时执行副作用函数。
useMemo：			依赖项变化时，重新一个缓存结果。
useCallback：	依赖变化时，重新创建一个函数。

useMemo的实现思路和 useEffect 就很像，只不过把执行结果返回回去。

let memoStore = []; // 存储所有 useMemo 的值
let memoIndex = 0;  // 跟踪当前 useMemo 的索引

function useMemo(factory, deps) {
    const currentIndex = memoIndex; // 当前 useMemo 的索引

    // 如果没有存储过这个索引的值或者依赖项发生变化
    if (
        memoStore[currentIndex] === undefined ||
        !areDepsEqual(memoStore[currentIndex].deps, deps)
    ) {
        // 计算新的值并存储
        memoStore[currentIndex] = {
            value: factory(),
            deps
        };
    }

    memoIndex++; // 增加索引以支持多个 useMemo

    return memoStore[currentIndex].value; // 返回存储的值
}
```

# Hooks分类
## 页面相关Hooks
##### useState（改变状态是异步的）
```javascript
返回值：是一个数组，第一个参数是变量，第二个参数是用于改变变量的方法，执行函数时可以传入一个默认值
//引入
    import React, { useState } from "react";
//使用并传入初始值
      const [count, set_count] = useState(5);    // 数组的解构依赖索引，所以用数组解构可以任意变量名
//改变数据
      const fn = () => {
        set_count(fn())
      }        
//整体使用
    const App = () => {
      const [count, set_count] = useState(5);
      const plus = () => {
        set_count((count) => count + 1);
      };
      const minus = () => {
        set_count((count) => count - 1);
      };
      return (
        <>
          <button onClick={minus}>-</button>
          <span>{count}</span>
          <button onClick={plus}>+ </button>
        </>
      );
    };    

// 当我们需要修改部分属性如name，并且不改变其他属性时，我们可以传入一个回调函数：
    setState((prev) => {return 
    	{  ...prev,  name: 'xxxx'  }
    });
```

##### useContext（组件通信）
```javascript
// 1. 创建 Context
const AppContext = React.createContext();

// 2. 顶层组件整合状态
function App() {
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState({ name: 'John' });

  const globalState = useMemo(() => ({
    theme, setTheme, user, setUser
  }), [theme, user]);

  return (
    <AppContext.Provider value={globalState}>
      <Header />
      <Content />
    </AppContext.Provider>
  );
}

// 3. 子组件消费状态
function Header() {
  const { theme, setTheme } = useContext(AppContext);
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      当前主题：{theme}
    </button>
  );
}
```

##### useLayoutEffect（同步执行副作用）
```javascript
useLayoutEffect 会阻塞 DOM 的更新，在浏览器完成渲染当前事务的所有微任务（microtask）之后（DOM更新之后执行）立即运行。
它在所有浏览器更新屏幕之前运行，通常是在浏览器重排（reflow）和重绘（repaint）之前。
useLayoutEffect比useEffect先执行，这是因为DOM更新之后，渲染还未结束。
作用：防止页面抖动（页面渲染后改变DOM元素属性（位移等）会产生页面抖动），主要和DOM操作相关。

import React, { useLayoutEffect, useRef, useState } from 'react';

const LayoutEffectExample = () => {
  const divRef = useRef(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    if (divRef.current) {
      setWidth(divRef.current.offsetWidth);
    }
  }, []);

  return (
    <div>
      <div ref={divRef} style={{ width: '50%' }}>
        This div is 50% of the parent width.
      </div>
      <p>The width of the div is: {width}px</p>
    </div>
  );
};

export default LayoutEffectExample;
```

##### useEffect（处理副作用）
```javascript
useEffect 的执行时机是在每次渲染结束之后，但不是立即执行，而是在浏览器完成重绘之后的空闲时间执行，不会阻塞 DOM 的更新。
参数：有两个参数，第一个参数是回调函数，如果没有第二个参数，那么它相当于componentDidMount和componentDidUpdate;
     第二个参数是一个数组，数组中存放依赖；
     如果是空数组，那么它只相当于 componentDidMount；如果传入了依赖（变量），那么它就会有监听效果；
//引入
    import React, { useEffect } from "react";

1、仅传入回调函数-相当于componentDidUpdate()和componentWillReceiveProps()，每次视图刷新都会执行
    useEffect(() => {
      console.log();
    }); 

2、传入第二个参数，参数为空数组时，相当于 componentDidMount()只执行一次，可以用作数据请求
    useEffect(() => {
     callback()
    },[]); 

3、传入第二个参数,当count发生 改变时触发监听，相当于shouldComponentUpdate()      
    useEffect(() => {
     console.log(count);
    }, [count]);    

4、模拟卸载阶段 componentWillUnmount() ，传入空数组，内部需要return
    useEffect(() => {
       window.addEventListener('scroll', removeFn);
    return () => {
      window.removeEventListener('scroll', removeFn);
    };
    }, []);       

useSelector和useDispatch (redux)
useDispatch作用：在函数组件中获取store的动作 

import { useSelector, useDispatch } from 'react-redux'
//在函数组件中使用：
const App = () => {
  const num = useSelector((state) => { return { data: state } });
  const dispatch = useDispatch();
  const add = () => {
    dispatch({ type: "plus" });
  };
  const minus = () => {
    dispatch({ type: "minus" });
  };
  return (
    <>
      <button onClick={minus}>-</button>
      <span>{num}</span>
      <button onClick={add}>+</button>
    </>
  );
};    
```

##### useMemo
```javascript
// 写法和useCallback一致，它是usecallback的自动调，当依赖的变量改变时才重新渲染，useMemo返回的是函数运行的结果
 const sum = useMemo(() => {                        
  let s = 1;
  for (let i = 1; i < count * 10; i++) {
     s *= i;
  }
   return s;                                     //return的s将被缓存
 }, [count]);
//调用
    <div>{sum}</div>             
      
//改写 useCallback(),只需要将原本的函数变成另一个函数的返回值就行
  const fn = useMemo(
    () =>() => {
      console.log(123);
  },[]);  

ps:使用 useMemo 和 useCallback 优化子组件 re-render 时，必须同时满足以下条件才有效:
	1、子组件已通过 React.memo（缓存子组件） 或 useMemo 被缓存；
	2、子组件所有的 prop 都被缓存。

//例如
	const PageMemoized = React.memo(Page);

	const App = () => {
  	const [state, setState] = useState(1);
  	const onClick = useCallback(() => {
   	 console.log('Do something on click');
  	}, []);
    
  return (
    // Page 和 onClick 同时 memorize
   	 <PageMemoized onClick={onClick} />
  	);
	};
```

##### useCallback（记忆函数）
```javascript
//对于类组件来说，每次改变只是render中的内容重新渲染，但对于函数组件来说是整个组件重新渲染，useCallback返回的是函数 
1、父组件改变阻止函数组件子组件自动渲染 memo 高阶组件，相当于类组件的PureComponent
//使用前解构
    import React, { useState, memo } from "react";
//使用方法
    const Child = memo(() => {
      console.log("子组件渲染了");
      return (
        <>
          <p>子组件</p>
        </>
      );
    });
    
2、当函数子组件存在自定义事件时，父组件的重新渲染会引起子组件重新渲染，我们使用 useCallback()
作用：解决自定义事件使子组件重新渲染，被处理过得函数将会被缓存
参数：两个参数，第一个是动作函数，第二个是依赖，如果依赖改变，那么子组件将重新渲染
//使用
    const fn = useCallback(() => {
     console.log("子组件又渲染了");
    }, []);
```

##### useEvent（缓存事件处理函数）
```javascript
function Chat() {
  const [text, setText] = useState("");

  const onClick = useEvent(() => {
    sendMessage(text);
  });

  return <SendButton onClick={onClick} />;
}
```

##### useRef
```javascript
// 组件初始化执行
// 使用，获取元素的值
import React, { useRef } from 'react'

const Child = () => {
  let username = useRef()
  let cardid = useRef()

  const onok = () => {
    username = username.current.value;
    cardid = cardid.current.value;
    const user = { username, cardid };
    console.log(user)
  }

  return (
    <div>
      <input type="text" name="username" id="username" ref={username} />
      <input type="text" name="cardid" id="cardid" ref={cardid} />
      <button onClick={onok}>按钮</button>
    </div>
  );
}

export default Child;
```

##### useImperativeHandle（子组件暴露内部方法给父组件）
```javascript
作用：子组件穿透ref
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
// 子组件写法
import React, { useImperativeHandle, forwardRef } from 'react';

const ChildComponent = forwardRef((props, ref) => {

  // 子组件的方法
  const myMethod = () => {  console.log('This is a method from ChildComponent') };

  // 使用useImperativeHandle来暴露方法
  useImperativeHandle(ref, () => ({
    myMethod: myMethod,
  }));

  // 子组件的渲染逻辑
  return <div>I am the ChildComponent</div>;
});

export default ChildComponent;

// 父组件
import React, { useRef } from 'react';
import ChildComponent from './ChildComponent';

const ParentComponent = () => {
  const childRef = useRef(null);

  // 调用子组件的方法
  const callChildMethod = () => {
    if (childRef.current) {
      childRef.current.myMethod();
    }
  };

  return (
    <div>
      <ChildComponent ref={childRef} />
      <button onClick={callChildMethod}>Call Child Method</button>
    </div>
  );
};

export default ParentComponent;
```

## 路由相关
##### useHistory
```javascript
//写在函数组件最顶层
  const history = useHistory();
  console.log(history);
//打印出如下信息：
   go: ƒ go(n)
   goBack: ƒ goBack()
   goForward: ƒ goForward()
   location: {pathname: '/about', search: '', hash: '', state: undefined, key: '4kysid'}
   push: ƒ push(path, state)
  replace: ƒ replace(path, state) 
```

##### useParams
```javascript
//写在函数组件最顶层
  const Params = useParams();
  console.log(Params);
//打印动态参数信息 
```

##### useRouteMatch
```javascript
//写在函数组件最顶层
    const RouteMatch = useRouteMatch();
    console.log(RouteMatch);
//获取如下信息：
    params: {}
    path: "/about"
    url: "/about"
```

##### useLocation
```javascript
//写在函数组件最顶层
    const Location = useLocation();
    console.log(Location);
//获取如下信息：
    hash: ""
    key: "zf2iae"
    pathname: "/about"
    search: ""
    state: undefined  
```

## redux相关
##### useSelector 、 useDispatch
```javascript
import { useSelector, useDispatch } from "react-redux";
import { updateCount } from "@actions/root";    // 导入redux动作

const Index = () => {
  const dispatch = useDispatch();
  const data = useSelector((state) => state);

  const handleClick = () => {
    dispatch(updateCount({ count: 2 }));
    // console.log(data);
  };

  return (
    <div className="about">
      <button onClick={() => handleClick()}>改变数据</button>
    </div>
  );
};

export default Index;
```

##### useReducer(无法使用中间件）
```javascript
参数：接收两个参数，第一个是reducer函数，第二个是初始的state（defaultState）
返回值：一个数组，有两项：state和dispatch
//定义数据仓库和函数
    const defaultState = { num: 20 };
    const reducer = (state, action) => {
      switch (action.type) {
        case "plus":
          return {
            ...state,
            num: state.num + 1,
          };
        case "minus":
          return {
            ...state,
            num: state.num - 1,
          };
        default:
          return { state };
      }
    };
//函数组件内部使用useReducer
    const App = () => {
      const [state, dispatch] = useReducer(reducer, defaultState);           //传入两个参数，返回两个方法待使用
      return (
        <>
          <h1>useReducer</h1>
          <button onClick={() => dispatch({ type: "minus" })}>-</button>     //写成箭头函数，防止传参时自动执行
          <span>{state.num}</span>
          <button onClick={() => dispatch({ type: "plus" })}>+</button>
        </>
      );
    };    
```

