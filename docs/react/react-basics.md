---
title: "React 基础"
sidebar_position: 1
---

# 核心设计
 React 是一个专注于构建用户界面的 声明式 JavaScript 库，其单向数据流和组件化设计与 MVVM 的双向绑定和 ViewModel 层有本质区别。虽然 React 可通过第三方库（如 MobX）实现类似 MVVM 的响应式效果，但其核心机制仍不属于 MVVM 架构。

##### React Fiber
```javascript
React Fiber 是 React 16 引入的一种新的协调引擎，旨在提高 React 应用的性能和响应能力。
Fiber 通过增量渲染、可中断与恢复、链表结构和优先级调度等机制，使得 React 可以更灵活地处理大量更新和复杂组件树。

工作原理：
调度：Fiber 引入了新的调度机制，允许 React 根据任务的优先级来调度任务。React 会根据任务的紧急程度将任务放入不同的队列中，并按照队列的顺序执行任务。
渲染：在渲染阶段，React 会遍历组件树，并构建一个 Fiber 树。Fiber 树中的每个节点代表一个组件，并包含组件的状态、属性等信息。
更新：当组件的状态或属性发生变化时，React 会触发更新。Fiber 会根据变化的类型和优先级来决定如何更新组件。
提交：在更新阶段完成后，React 会将 Fiber 树转换为实际的 DOM 树，并提交给浏览器进行渲染。
```

###### Fiber 调度流程图（简化）
```plain
用户触发 setState()
        ↓
创建 Update 对象 → 分配优先级（Lane）
        ↓
调度器（Scheduler）将任务加入队列
        ↓
浏览器空闲？ → 是 → 执行 workLoop（Render 阶段）
        ↓
遍历 Fiber 树，逐节点 diff
        ↓
时间片用完？ → 是 → 暂停，等待下次空闲
        ↓
Render 完成 → Commit 阶段（同步更新 DOM）
```

###### 1. Fiber 节点：工作单元
每个 React 元素对应一个 **Fiber 节点**，它是一个 JavaScript 对象，包含：

+ `type`：组件类型（div / MyComponent）
+ `props`：属性
+ `child` / `sibling` / `return`：构成**链表式树结构**（便于遍历）
+ `alternate`：指向 work-in-progress 树（用于双缓存）
+ `effectTag`：标记副作用（如插入、更新、删除）

###### 2. 双阶段架构：Render 阶段 + Commit 阶段
| 阶段 | 是否可中断 | 作用 |
| --- | --- | --- |
| **Render 阶段** | ✅ 可中断 | 生成 Fiber 树，计算变更（diff） |
| **Commit 阶段** | ❌ 不可中断 | 应用变更到 DOM（调用生命周期、副作用） |


###### 3. 调度器（Scheduler）：基于优先级的时间切片
React 使用 `**Scheduler**`** 包**（独立于 React）实现任务调度：

###### 🔹 核心思想：
+ 将任务分配**优先级（Lane 模型）**
+ 利用 `**requestIdleCallback**`**（或 polyfill）** 在浏览器空闲时执行低优先级任务
+ 高优先级任务（如用户点击）可**打断**低优先级任务

###### 🔹 优先级分类（从高到低）：
| 优先级 | 触发场景 |
| --- | --- |
| **Immediate** | `ReactDOM.flushSync()`、错误边界 |
| **User Blocking** | 用户交互（点击、输入） |
| **Normal** | 默认更新（如 `setState`） |
| **Low** | 数据更新（如网络请求结果） |
| **Idle** | 预加载、非关键更新 |


###### 4. 工作循环（Work Loop）：可中断的遍历
```javascript
function workLoop(deadline) {
    while (nextUnitOfWork && !shouldYield(deadline)) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
      }
    
    if (nextUnitOfWork) {
        // 时间片用完，下次空闲继续
        scheduleCallback(workLoop);
      } else {
        // 完成 Render，进入 Commit
        commitRoot();
      }
  }

// 浏览器是否需要交出控制权？
function shouldYield(deadline) {
    return deadline.timeRemaining() < 0 || deadline.didTimeout;
}
关键点：每次处理一个 Fiber 节点后，检查是否还有剩余时间（通常 ≤5ms），若没有则暂停，等下一次空闲再继续。
```

###### 5. 任务插队与重排（Lane 模型）
当高优先级更新到来时：

1. 中断当前低优先级 Render
2. 保存当前进度（Fiber 树状态保留在内存中）
3. 优先处理高优先级更新
4. 完成后恢复低优先级任务（可能丢弃部分已计算结果）

##### React 和 React Dom 有什么关系
● React 是核心库，负责定义组件、管理状态和生命周期，并创建描述界面的虚拟 DOM 对象。

● ReactDOM 是一个专门用于浏览器环境的“渲染器”，它的核心任务就是将 React 创建的虚拟 DOM 渲染到真实的浏览器 DOM 中，并处理用户交互。

##### React虚拟DOM
```html
React提出的一种解决方案，它是一个轻量级的JavaScript对象，用来描述真实DOM的结构和属性。
React通过比较虚拟DOM的差异，计算出需要更新的部分，然后再将这些部分更新到真实DOM上。
React虚拟DOM的原理是：
1. 首先，React将组件的状态和属性传入组件的render方法，得到一个虚拟DOM树。
2. 当组件的状态或属性发生变化时，React会再次调用render方法得到新的虚拟DOM树。
3. React会将新旧两棵虚拟DOM树进行比较，得到它们的不同之处。
4. React会将这些不同之处记录下来，然后批量的更新到真实的DOM树上。

React通过虚拟DOM树的比较，避免了直接操作真实DOM树带来的性能问题，因为直接操作真实DOM树会带来大量的重排和重绘，而React的虚拟DOM树的比较和更新是基于JavaScript对象进行的，不会导致页面的重排和重绘。
总结起来，React虚拟DOM的原理就是：通过比较虚拟DOM树的不同，批量的更新真实的DOM树，从而提高页面的性能。
```

```javascript
1、框架设计原因：render函数无法绑定更新的数据，会全量生成渲染dom，开销比较高；
2、跨平台 
```

##### React Diff算法
```javascript
React Diff是React中用于更新Virtual DOM的算法它的目的是在最小化DOM操作的同时，尽可能快地更新组件。它通过比较Virtual DOM树的前后两个状态来确定哪些部分需要更新。
React Diff算法的核心思想是尽可能地复用已有的DOM节点。当Virtual DOM中的某个节点发生变化时，React会先比较该节点的属性和子节点是否有变化，如果没有变化，则直接复用该节点。如果有变化，则会在该节点的父节点下创建一个新的节点，并将新的属性和子节点赋值给该节点。
React Diff算法的具体实现有两种方式：深度优先遍历和广度优先遍历。深度优先遍历是指先比较父节点的子节点，如果子节点有变化，则递归比较子节点的子节点。广度优先遍历是指先比较同级节点，如果同级节点有变化，则递归比较子节点。
React Diff算法的优化策略包括：key属性的使用、组件的shouldComponentUpdate方法、使用Immutable.js等。其中，key属性的使用是最常用的优化策略，它可以帮助React更准确地判断哪些节点需要更新，从而减少不必要的DOM操作。

React Diff算法具有以下特点：
1. 先判断两个节点是否相等，如果相等，就不需要更新。
2. 如果两个节点类型不同，则直接替换节点。
3. 如果节点类型相同，但是节点属性不同，则更新节点属性。
4. 如果节点类型相同，但是子节点不同，则使用递归的方式进行更新。
React Diff算法的时间复杂度是O(n)，其中n为Virtual DOM树中节点的数量。

// 实例：
在React中，渲染数组时将数组的第一项移动到最后渲染的开销通常比将最后一项移动到第一项渲染的开销要大：

这是因为React使用了虚拟DOM（Virtual DOM）来进行高效的DOM操作。
当数组中的元素发生变化时，React会比较新旧虚拟DOM树的差异，并只更新需要更新的部分。
如果将数组的第一项移动到最后，React需要重新计算并比较整个数组的差异，这可能会导致更多的DOM操作。
相比之下，将最后一项移动到第一项只会影响数组的第一项和最后一项，而不会影响其他元素的位置。
因此，React只需要比较这两个元素的差异，并进行相应的DOM操作，这通常比重新计算整个数组的差异要更高效。
```

# 组件和基础
##### 组件生成方式（命令式）
```bash
import React from 'react';
import ReactDOM from 'react-dom';

// 创建一个React元素
const myDiv = React.createElement('div', { id: 'myDiv', className: 'example' }, 'Hello World');

// 获取DOM节点
const container = document.getElementById('root');

// 渲染React元素到DOM节点
ReactDOM.render(myDiv, container);
```

##### 组件的生成方式（声明式）
```javascript
import React, { Component }from "react";
//组件名首字母大写
//类生成方式
class Header extends Component {
  render() {
    return <div>微博头部</div>;
  }
}
//函数组件：没有生命周期，不能定义自己的状态（）
//ES5生成方式
function Main() {
  return <main>微博的内容</main>;
}
//ES6生成方式
const Footer = () => {
  return <footer>微博底部</footer>;
};

class App extends Component {
  render() {
    return (
      <>
        {/* Fragment是一个空的占位标签 */}
        <Header />
        <Main />
        <Footer />
      </>
    );
  }
}

export default App;
```

##### 受控组件
```javascript
//内容可以由我们自己来控制的组件，必须要有value和onChange
class App extends Component {
  state = {
    valueText: 1
  }
  handleChange = (e) => {
    this.setState({
      valueText: e.target.value,    //输入的值
    });
  }
  handleClick = () => {
    console.log(this.state.valueText);
  }
  render() {
    return (
      <>
        <input
          type="text"
          value={this.state.valueText}
          onChange={this.handleChange}
        />
        <button onClick={this.handleClick}>btn</button>
      </>
              <p>输入的值是：{this.state.valueText}</p>   //实现双向绑定效果
    );
  }
}

//函数组件 useState
 const setUserName = (e) => {
        setUserRealName(e.target.value)
    }
```

##### 非受控组件
```javascript
//解构createRef，创建Refs并通过ref属性联系到React组件。Refs通常当组件被创建时被分配给实例变量，这样它们就能在组件中被引用。
import React, { Component, createRef } from "react";
class App extends Component {
  num = createRef();       //current 属性是唯一可用的属性
  handleClick2 = (ipt) => {
    console.log(this.num.current.value);
  }
  render() {
    return (
      <>
        <input type="text" ref={this.num} />
        <button onClick={this.handleClick2}>btn</button>
      </>
    );
  }
}
```

##### 样式和类
```javascript
1、组件中的内联样式
class Header extends React.Component {
  render() {
    return (<header style={{color:"red"}}>这是头</header>)    //外层{}为jsx语法，内层{}为对象写法
  }
}

2、直接导入css
import "XXX.css";     //导入定义过的css文件
const Main = ()=>{
  return (<main className="orange big">这是身体</main>)      //class为关键字，必须使用className
}

3、不同的条件添加不同的样式-使用classnames这个包
//下载安装classnames包
$npm i classnames
//引入classnames包
import classNames from "classNames/bind"
//引入CSS文件
import styles from './classNames.css'
let cx = classNames.bind(styles);

function Footer() {
  let className = cx({
    blue: true,
    red: false
  }) ;
  return <footer className={className}>这是脚</footer>;
}

4、在js中写css改变样式
//安装包
$npm i styled-components
//新建含有css的js文件，导入模块并导出样式
import styled from "styled-components";
const Pstyled = styled.h1`                      //h1为标签名，后面接模板字符串
  color: red;
  font-size: ${(props) => props.size + "px"}; `;  //可以通过props传值
export { Pstyled };
//组件中使用
import React, { Component } from "react";
import { Pstyled } from "./scc-in-js.js";

class App extends Component {
  render() {
    return (
      <>
        <Pstyled size="60">styled-components</Pstyled>
      </>
    );
  }
}
export default App;
```

##### state-状态
```javascript
1、通过申明式地定义state
class App extends Component {
  state = {
    num: 10,
  }
  render() {
    const { num } = this.state;     //解构state中的num
    return (
      <><h1>
        num - {num}
      </h1></>
    )
  }
}
2、通过构造函数的构造器constructor来定义state,当我们去实例化这个类的时候，它是会自动执行的
class App extends Component {
  constructor() {
     // 用于继承父类，只有调用过super之后才能使用this
    super();
    this.state = {
      num: 10,
    }
  }
  render() {
    return (
      <>
        <p>
          num - {this.state.num}
        </p>
      </>
    )
  }
}

! setState在合成事件是异步的
! setState在生命周期里是异步的
! setState在定时器里面是同步的
! setState在原生js里面是同步的

//setState有两种写法
//第一种是里面写对象,允许setState传第二个参数，是回调函数
    this.setState(               //需要修正this的指向
      {
        count: 10,
      },
      () => {
        console.log(this.state.count);
      }
    );
    
//第二种方式是里面写函数, 可以接收一个参数(任意形参)，表示前一次的state,允许setState传第二个参数，是回调函数
    this.setState(                                  //需要修正this的指向
      (prevState) => {
        return {
            list: prevState.list.concat(item),      //list: [...prevState.list, item],
        };
      },
      () => {
        console.log(this.state.item);
      }
    );
```

##### Portal（改变元素在DOM结构中的位置）
```javascript
//解构
import { createPortal } from "react-dom";
//应用
class App extends Component {
  render() {
    return (
      <div>
        <h3>portal</h3>
        {createPortal(<Child />, document.querySelector("html"))}             //函数，传入两个参数，第一个为组件，第二个为位置
      </div>
    );
  }
}
```

# 类组件生命周期
##### React组件的生命周期分为三个阶段：挂载阶段、更新阶段和卸载阶段
```javascript
挂载阶段包括以下方法：

- constructor：组件被创建时调用，用于初始化状态和绑定事件处理函数。
- getDerivedStateFromProps：在组件挂载之前和更新时调用，用于根据props更新state。
- render：根据props和state渲染组件。
- componentDidMount：组件挂载后调用，用于进行异步操作和DOM操作。

更新阶段包括以下方法：

- getDerivedStateFromProps：在组件更新时调用，用于根据props更新state。
- shouldComponentUpdate：在组件更新前调用，用于判断是否需要重新渲染组件。
- render：根据props和state渲染组件。
- componentDidUpdate：在组件更新后调用，用于进行异步操作和DOM操作。

卸载阶段包括以下方法：

- componentWillUnmount：在组件卸载前调用，用于清理定时器、取消订阅等操作。
```

##### react更新触发生命周期
```javascript
1. componentWillReceiveProps(nextProps)
   当父组件接收到新的props时，会触发该生命周期方法。子组件的改变可能会导致父组件的props发生变化，从而触发该方法。

2. shouldComponentUpdate(nextProps, nextState)
   当父组件的props或state发生改变时，会触发该方法。该方法用于判断是否需要重新渲染组件。如果返回false，组件将不会更新。

3. componentWillUpdate(nextProps, nextState)
   在组件更新之前调用，可以在此方法中进行一些准备工作或进行一些副作用操作。

4. render()
   无论父组件的props或state是否发生改变，都会触发render方法重新渲染父组件。

5. componentDidUpdate(prevProps, prevState)
   在组件更新之后调用，可以在此方法中进行一些副作用操作，比如更新DOM或发送网络请求。

需要注意的是，以上生命周期方法中的一些在未来版本的React中可能会被废弃或改变。因此，建议在使用时查看React官方文档以获取最新信息。
```

## 类组件的生命周期-旧版
<!-- 这是一张图片，ocr 内容为：父组件RENDER 挂载时 COMPONENTWILLRECEIVEPROPS CONSTRUCTOR SETSTATE() SHOULDCOMPONENTUPDATE COMPONENTWILLMOUNT FORCEUPDATE() COMPONENTWILLUPDATE RENDER COMPONENTDIDUPDATE COMPONENTDIDMOUNT COMPONENTWILLUNMOUNT -->
![](https://cdn.nlark.com/yuque/0/2022/jpeg/28684553/1654827251234-ffb3ca94-f299-4651-92ec-bd4523b5fa3a.jpeg)

##### 初始化
```javascript
  // 当这个类被实例化的时候就会自动执行，最先执行，并且只执行一次
  constructor(props) {               // 当props的值需要作为state的初始值的时候
    super(props);                    //super必须写在最前面
    this.state = {
      count: 10,
    };
    this.ipt = createRef();         //非受控组件传值
  }
```

##### 挂载阶段
```javascript
 // componentWillMount是被废弃了, 改名成了UNSAFE_componentWillMount
  UNSAFE_componentWillMount() {
    console.log("componentWillMount");
    // componentWillMount不能做数据请求
    // 因为fiber算法的原因,可能导致这个生命周期被执行多次
  }

  // render本身就是一个生命周期,每次数据改变都重新渲染
  render() {
    console.log("render");
    return (
      <>
        <h3>老版生命周期</h3>
        <p>count: {this.state.count}</p>
      </>
    );
  }

  // 组件挂载完成之后
  componentDidMount() {
    console.log("componentDidMount");
    this.setState({
      count: 20,
    });
  }
```

##### 更新阶段
```javascript
// 被废弃了, 因为现在由更好的生命周期来代替
// 当父组件传递的自定义属性发生改变时就会触发
  UNSAFE_componentWillReceiveProps(nextProps) {
    console.log(nextProps);
  }
  
//决定子组件是否重新渲染
// 必须要返回true或者false, 通过返回true或者false来控制是否要重新渲染当前组件
// 可以接收两个参数，新的props和新的state，旧的还是this.props.xxx
// PureComponent 纯组件   用于代替Component
shouldComponentUpdate(nextProps, nextState) {
    return nextState.count !== this.state.count;
  }
  
// 被弃用
  UNSAFE_componentWillUpdate() {
    console.log("componentWillUpdate");
  }
   
// 更新结束
// 不能在这里更新数据
  componentDidUpdate() {
    console.log("componentDidUpdate");
  } 
```

##### 卸载阶段
```javascript
//组件将要销毁
componentWillUnmount() {
    // 定时器，事件监听，websocket, 插件等
    console.log("componentWillUnmount");
  }
```

## 类组件的生命周期-新版
<!-- 这是一张图片，ocr 内容为：更新时 卸载时 挂载时 FORCEUPDATE) NEW PROPS SETSTATE( CONSTRUCTOR GETDERIVEDSTATEFROMPROPS SHOULDCOMPONENTUPDATE X RENDER GETSNAPSHOTBEFOREUODATE REACT更新DOM和REFS COMPONENTDIDMOUNT COMPONENTDIDUPDATE COMPONENTWILLUNMOUNT -->
![](https://cdn.nlark.com/yuque/0/2022/jpeg/28684553/1654827355097-329ccf06-da37-41be-aebc-08fcb6d15c00.jpeg)

##### getDerivedStateFromProps
```javascript
// 根据props的值去获取一个新的state
// 它前面要有一个static关键字
// 必须要return 对象或者null  如果null表示啥也不做，如果是对象就会合并之前的state
```

##### getSnapshotBeforeUpdate
```javascript
// 生成一个快照在更新之前
// 拿到更新前的状态给更新以后用
  getSnapshotBeforeUpdate(prevProps, prevState) {
    // 快照就是某一条记录或者某一个值，return出来被销毁周期接收
    return prevState;
  }
  
// componentDidUpdate第三个参数就是getSnapshotBeforeUpdate里面return的那个值
  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log(snapshot);
  }
```

# 传参与通信
##### props传值检测
```javascript
//安装包prop-types
$ npm i prop-types -S
//解构
import { number, string } from "prop-types";
//类组件检测
class Child extends Component {
  static propTypes = {
    count: number,
    msg: string,
  };
  render() {
    return <div>child - {this.props.count}</div>;
  }
}
//函数组件检测
const Child = (props) => {
  return <div>child - {props.count}</div>;
};
Child.propTypes = {
  count: number,
  msg: string,
};
```

##### 父组件向子组件通信：使用 props
```javascript
父组件 App.js：
import React,{ Component } from "react";
import Sub from "./SubComponent.js";
import "./App.css";
export default class App extends Component{
    render(){
        return(
            <div>
                <Sub title = "今年过节不收礼" />
            </div>
        )
    }
}

子组件 SubComponent.js：
import React from "react";
const Sub = (props) => {
    return(
        <h1>
            { props.title }
        </h1>
    )
}

export default Sub;
```

##### 子组件向父组件通信：使用 props 回调
```javascript
SubComponent.js代码：
import React from "react";
const Sub = (props) => {
    const cb = (msg) => {
        return () => {
            props.callback(msg)
        }
    }
    return(
        <div>
            <button onClick = { cb("我们通信吧") }>点击我</button>
        </div>
    )
}
export default Sub;

App.js代码：
import React,{ Component } from "react";
import Sub from "./SubComponent.js";
import "./App.css";
export default class App extends Component{
    callback(msg){
        console.log(msg);
    }
    render(){
        return(
            <div>
                <Sub callback = { this.callback.bind(this) } />
            </div>
        )
    }
}
```

##### 兄弟间的传参
```javascript
1：子组件1中的事件去触发定义在父组件中的自定义事件，并传入子组件中的变量
class Child1 extends Component {
  state = {
    count: 10,
  }
  change = () => {                                               //去触发父组件中定义的事件
    this.props.onchange(this.state.count)
  }
  render() {
    return (
      <>
        <div>{this.state.count}</div>
        <button onClick={this.change}>按钮</button>
      </>
    );
  }
}

2：父组件被子组件1的事件触发自己定义的事件，改变自己组件中的变量的值
class App extends React.Component {
  state = { count: 5 }
  Change = (count) => {
    this.setState({ count: count })
  }
  render() {
    return (
      <>
        <Child1 onchange={this.Change}></Child1>                 //上面的onchange为此处的事件
        <p>****************************************************************</p>
        <Child2 count={this.state.count}></Child2>
      </>
    )
  }
}

3：子组件2用props去接收数据
//函数组件
const Child2 = (props) => {
  return <p>{props.count}</p>
}
//类组件
class Done extends Component {
  render() {
    return (
      <>
        <p>{this.props.msg}</p>       //接收props数据
      </>
    );
  }
}
```

##### 跨级组件间通信：使用 context 对象
```javascript
App.js代码：
import React, { Component } from 'react';
import PropTypes from "prop-types";
import Sub from "./Sub";
import "./App.css";
export default class App extends Component{
    // 父组件声明自己支持 context
    static childContextTypes = {
        color:PropTypes.string,
        callback:PropTypes.func,
    }
    // 父组件提供一个函数，用来返回相应的 context 对象
    getChildContext(){
        return{
            color:"red",
            callback:this.callback.bind(this)
        }
    }
    callback(msg){
        console.log(msg)
    }
    render(){
        return(
            <div>
                <Sub></Sub>
            </div>
        );
    }
} 

Sub.js代码：
import React from "react";
import SubSub from "./SubSub";

const Sub = (props) =>{
    return(
        <div>
            <SubSub />
        </div>
    );
}
export default Sub;

SubSub.js代码：
import React,{ Component } from "react";
import PropTypes from "prop-types";
export default class SubSub extends Component{
    // 子组件声明自己需要使用 context
    static contextTypes = {
        color:PropTypes.string,
        callback:PropTypes.func,
    }
    render(){
        const style = { color:this.context.color }
        const cb = (msg) => {
            return () => {
                this.context.callback(msg);
            }
        }
        return(
            <div style = { style }>
                SUBSUB
                <button onClick = { cb("我胡汉三又回来了！") }>点击我</button>
            </div>
        );
    }
}

//解构出 createContext 函数
import React, { Component, createContext } from "react";
// Provider提供者，依赖
// Consumer消费者，注入
const { Provider, Consumer } = createContext();

//用Provider标签包裹父组件，Provider还必须要由一个属性value用来传参，可以传变量或者函数
render() {
    return (
      <Provider value={{ num: this.state.num }}>
        <p>这是父组件</p>
        <Child1 />
      </Provider>
    );
  }
  
//子组件用Consumer去接收，里面写一个函数，参数为Value
     <Consumer>
          {(value) => (
            <>
              <button onClick={value.fn1}>-</button>
              <span>{value.num}</span>
              <button onClick={value.fn2}>+</button>
            </>
          )}
    </Consumer>
```

##### 父组件调用子组件的方法
```javascript
在 React 中，可以使用 `ref` 来获取子组件的实例，并调用其方法。下面是一个示例：假设有一个子组件 `Child`，其中有一个 `handleClick` 方法：

class Child extends React.Component {
  handleClick() {
    console.log('Child clicked')
  }

  render() {
    return <button onClick={this.handleClick}>Child button</button>
  }
}

现在我们想要在父组件中调用 `Child` 组件的 `handleClick` 方法。我们可以在父组件中创建一个 `ref`，在 `Child` 组件上引用这个 `ref`，然后就可以在父组件中调用 `Child` 组件的 `handleClick` 方法了。

class Parent extends React.Component {
  childRef = React.createRef()

  handleClick() {
    this.childRef.current.handleClick()
  }

  render() {
    return (
      <div>
        <Child ref={this.childRef} />
        <button onClick={() => this.handleClick()}>Call child method</button>
      </div>
    )
  }
}

在上面的代码中，我们首先创建了一个 `childRef`，然后在 `Child` 组件上引用这个 `ref`。在父组件中，我们创建了一个 `handleClick` 方法，该方法通过 `childRef.current.handleClick()` 调用了 `Child` 组件的 `handleClick` 方法。最后，我们在父组件中渲染了一个按钮，当点击这个按钮时，会调用 `handleClick` 方法，从而触发 `Child` 组件的 `handleClick` 方法。

需要注意的是，只有在 `Child` 组件挂载到 DOM 中后，`childRef.current` 才会有值，因此要确保在调用 `handleClick` 方法之前 `Child` 组件已经挂载到了 DOM 中。
```

```javascript
// 子组件
import React, { useImperativeHandle, useRef } from 'react';

const ChildComponent = React.forwardRef((props, ref) => {
  const childRef = useRef();

  // 子组件的方法
  const myMethod = () => {
    console.log('This is a method from ChildComponent');
  };

  // 使用useImperativeHandle来暴露方法
  useImperativeHandle(ref, () => ({
    myMethod: myMethod
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

# 全局状态管理Redux
##### 依赖安装
```javascript
yarn add redux react-redux redux-actions --save -D
```

##### 创建reducers
```javascript
// 子reduce.js文件
import { handleActions } from "redux-actions";

const initialState = {
  match: {
    status: true,
  },
  count: 1,
};
export default handleActions(
  {
    UPDATE_MATCH(state, action) {
      return Object.assign({}, state, action.payload);
    },
    UPDATE_COUNT(state, action) {
      return Object.assign({}, state, action.payload);
    },
  },
  initialState
);

// 使用index.js文件，聚合所有文件夹的reduce
import { combineReducers } from "redux";
import root from "./root";

const rootReducer = combineReducers({
  root,
});

export default rootReducer;
```

##### 创建actions
```javascript
import { createAction } from "redux-actions";

export const updateMatch = createAction("UPDATE_MATCH");

export const updateCount = createAction("UPDATE_COUNT");
```

##### 创建store
```javascript
// src/store/index.js
import { createStore, applyMiddleware } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import thunkMiddleware from 'redux-thunk';
import logger from 'redux-logger';      // 日志
import rootReducer from '../reducers';

const routeMiddleware = routerMiddleware();

let createStoreWithMiddleware;
if (process.env.NODE_ENV !== 'production') {
  createStoreWithMiddleware = applyMiddleware(
    thunkMiddleware,
    routeMiddleware,
    logger
  )(createStore);
} else {
  createStoreWithMiddleware = applyMiddleware(
    thunkMiddleware,
    routeMiddleware
  )(createStore);
}

const store = createStoreWithMiddleware(rootReducer);

export default store;
```

##### 穿透整个项目文件
```javascript
import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { Router, Switch, Redirect, Route } from "react-router-dom";
import history from "./utils/history";
import routes from "./router/config";
import { Provider } from "react-redux";
import store from "@store/configureStore";

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(
  <Provider store={store}>
    <Router history={history}>
      <Suspense fallback={<div>loading...</div>}>
        <Switch>
          {routes.map((item, index) => {
            return (
              <Route key={index} path={item.path} component={item.component} />
            );
          })}
          <Redirect from="/*" to="/" />
        </Switch>
      </Suspense>
    </Router>
  </Provider>
);
```

##### 项目文件使用
```javascript
import { useSelector, useDispatch } from "react-redux";
import { updateCount } from "@actions/root";

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

## redux异步操作
##### 异步操作- redux-thunk库
```javascript
//action必须是扁平化对象
1、安装redux-thunk库，并且在reducer的index文件中解构applyMiddleware
    $yarn add redux-thunk
// applyMiddleware表示中间件
    import { createStore, applyMiddleware } from "redux"; 
//引入redux-thunk
    import thunk from "redux-thunk";       
// applyMiddleware执行的时候要接收一个参数, 里面接收redux的异步库
    const store = createStore(reducer, applyMiddleware(thunk));
        
2、创建一个异步函数去调用同步函数，改变数据
    export const loadAsyncAction = () => {
      // redux-thunk异步库允许我们在这里return函数， 并且可以接收dispatch接收参数
      // 而且这个函数会自动执行
      return (dispatch) => {
        // 数据请求
        fetch(
          "https://www.fastmock.site/mock/918b096c85edca5de807f1f8398af51e/api/list"
        )
          .then((response) => response.json())
          .then((res) => {
            dispatch(loadAction(res.list));
          });
      };
    };
    const loadAction = (payload) => {
      return {
        type: "load",
        payload: payload,
       };
    };
```

# 懒加载Lazy
##### import函数
```javascript
//import 命令
import { add } from './math';
console.log(add(16, 26));

//import函数
import("./math").then(math => {
  console.log(math.add(16, 26));
});
```

##### lazy函数和Suspense组件-组件中的使用
```javascript
1、解构lazy、Suspense
    import { lazy, Suspense } from "react";
2、使用lazy配合import引入组件
    const Child = lazy(() => import("./Child"));
3、使用Supense包裹元素，切Supense中还有个属性 fallback ，里面写一个加载过程中显示内容的组件
    <Suspense fallback={<div>loading...</div>}>
      {this.state.isShow && <Child />}
    </Suspense>
```

##### lazy函数和Suspense组件-路由中的使用
```javascript
const Home = lazy(() => import("./Home"));
const About = lazy(() => import("./About"));

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <ul>
          <li>
            <Link to="/home">home</Link>
          </li>
          <li>
            <Link to="/about">about</Link>
          </li>
        </ul>
        <Suspense fallback={<div>loading...</div>}>
          <Switch>
            <Route path="/home" component={Home}></Route>
            <Route path="/about" component={About}></Route>
          </Switch>
        </Suspense>
      </BrowserRouter>
    );
  }
}
```

# 装饰器
```javascript
1、下载安装依赖
yarn add @babel/core @babel/plugin-proposal-decorators @babel/preset-env

2、创建 .babelrc
{
  "presets": [
    "@babel/preset-env"
  ],
    "plugins": [
      [
        "@babel/plugin-proposal-decorators",
        {
          "legacy": true
        }
      ]
    ]
}

3、创建config-overrides.js
const path = require('path')
const { override, addDecoratorsLegacy } = require('customize-cra')

function resolve(dir) {
  return path.join(__dirname, dir)
}

const customize = () => (config, env) => {
  config.resolve.alias['@'] = resolve('src')
  if (env === 'production') {
    config.externals = {
      'react': 'React',
      'react-dom': 'ReactDOM'
    }
  }
  
  return config
};
module.exports = override(addDecoratorsLegacy(), customize())

4、安装依赖
yarn add customize-cra react-app-rewired

5、修改package.json
  ...
  "scripts": {
    "start": "react-app-rewired start",
      "build": "react-app-rewired build",
        "test": "react-app-rewired test",
          "eject": "react-app-rewired eject"
  },
    ...
    
    6、使用withRoute
    import { withRouter } from "react-router-dom";
//在需要获得路由信息的组件前使用
    @withRoute
```

## 移动端适配
```javascript
1、在config-overrides.js中的customize-cra去配置，customize-cra是一个NPM包，用来做webpack的配置；
2、下载插件 postcss-px2rem 
3、修改config-overrides.js文件(新增以下内容)
    const {addPostcssPlugins } = require("customize-cra");
    module.exports = override(
      addPostcssPlugins([require("postcss-px2rem")({ remUnit: 37.5 })])
    );
```

# HOC高阶组件
```javascript
// 高阶组件=>函数， 传入一个组件(函数组件、类组件)，返回一个新组件
// 作用： 增强组件的功能，复用
//封装一个高阶组件js文件
const withHoc = (Comp) => {
  return class extends Component {
    render() {
      console.log(this.props);
      return (
        <>
          <Comp msg="hello" {...this.props} />     //展开合并原有属性
        </>
      );
    }
  };
}

//在其他组件中使用
export default withHoc(App);
```
