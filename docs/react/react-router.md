---
title: "React Router"
sidebar_position: 3
---

```javascript
1、安装react-router-dom
$yarn add react-router-dom
2、从react-router-dom中解构 BrowserRouter,Link,Route,Switch
// 如果我们的项目要使用路由，要在整个项目的最外面套一个BrowserRouter组件
//实现地址变化使用Link组件
//Route要匹配渲染，path属性和component属性
//react的路由默认是包容性路由，使用exact属性(精准匹配)或者Switch组件是将路由变成排他性路由, 分支匹配
    import React, { Component } from "react";
    import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
    
    const Home = () => <div>home</div>;
    const About = () => <div>About</div>;
    const Topics = () => <div>Topics</div>;
    
    class App extends Component {
      state = {};
      render() {
        return (
          <BrowserRouter>
            <h1>你好--路由</h1>
            <ul>
              <li>
                <Link to="/home">home</Link>
              </li>
              <li>
                <Link to="/about"> about</Link>
              </li>
              <li>
                <Link to="topics">topics</Link>
              </li>
            </ul>
            <Switch>
              <Route path="/home" component={Home}></Route>
              <Route path="/about" component={About}></Route>
              <Route path="/topics" component={Topics}></Route>
            </Switch>
          </BrowserRouter>
        );
      }
    }
    
    export default App;
```

### 嵌套路由
```javascript
//引入模块    
    import React, { Component } from "react";
    import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
//根路由 
    class App extends Component {
      render() {
        return (
          <BrowserRouter>
            <h1>路由嵌套</h1>
            <ul>
              <li>
                <Link to="/home">home</Link>
              </li>
              <li>
                <Link to="/about">about</Link>
              </li>
              <li>
                <Link to="/topics">Topics</Link>
              </li>
            </ul>
            <Switch>
              <Route path="/home" component={Home} />
              <Route path="/about" component={About} />
              <Route path="/topics" component={Topics} />
            </Switch>
          </BrowserRouter>
        );
      }
    }
    
    export default App;
    
//一级路由
    const About = () => {
      return <div>about</div>;
    };
    const Topics = () => {
      return <div>topics</div>;
    };



            
//嵌套子路由
    const HomeFirst = () => <div>home-first</div>;
    const HomeSec = () => <div>home-sec</div>;
    const HomeThree = () => <div>home-three</div>;
//嵌套路由
    const Home = () => {
      return (
        <div>
          <h1>home</h1>
          
          <ul>
            <li>
              <Link to="/home/home-first">home-first</Link>
            </li>
            <li>
              <Link to="/home/home-sec">home-sec</Link>
            </li>
            <li>
              <Link to="/home/home-three">home-three</Link>
            </li>
          </ul>
          <Switch>
            <Route path="/home/home-first" component={HomeFirst} />
            <Route path="/home/home-sec" component={HomeSec} />
            <Route path="/home/home-three" component={HomeThree} />
          </Switch>
        </div>
      );
    };
```

### 动态参数
```javascript
 import React, { Component } from "react";
    import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
    
    const Home = () => <div>home</div>;
    const Topics = (props) => {
      //获取传过来的id： props.match.params.id
      return <div> topics-id :{props.match.params.id} </div>;
    };
    
    class App extends Component {
      state = {};
      render() {
        return (
          <BrowserRouter>
            <h1>你好--动态路由</h1>
            <ul>
              <li>
                <Link to="/home">home</Link>
              </li>
              <li>
                <Link to="/topics/1">Topics1</Link>
              </li>
              <li>
                <Link to="/topics/2">Topics2</Link>
              </li>
            </ul>
            <Switch>
              <Route path="/home" component={Home}></Route>
              <Route path="/topics/:id" component={Topics}></Route>
            </Switch>
          </BrowserRouter>
        );
      }
    }
```

### 路由渲染
```javascript
//在Route里面要渲染组件，要用component属性
//除了component属性,还可以用render属性来渲染组件;render只能渲染函数组件不能渲染类组件、不能直接获取路由信息；
    //改写并获得路由信息：
    <Route path="/home" render={(props)=><Home {...props} />}></Route>
//还可以用chilren属性去渲染;children属性也只能渲染函数组件;不管path是否匹配都渲染, 一般会和Switch一起使用
//还可以将组件直接写在Route组件的中间而不使用component属性;这种写法拿不到路由信息
```

### 路由重定向
```javascript
//解构 Redirect 组件
//搭配switch组件使用exact属性精准匹配
<Switch> 
    <Redirect from="/" to="/home" exact></Redirect> 
</Switch>
```

### 路由鉴权
```javascript
//在Route组件中，使用render渲染函数组件，返回结果前进行判断，如果不满足条件则使用重定向(Redirect)另一个页面
<Switch> 
  <Route path="/userCenter" 
  	render={() => { localStorage.getItem("token") ？<userCenter /> ：<Redirect to="/login"> </Redirect> } ></Route>  // 鉴权
  <Route path="/login" component={Login}></Route>
  <Route path="*" component={NotFound}></Route>   //404路由，使用的时候配合Switch组件，并且写在最后
</Switch>
```

### Navlink标签
```javascript
//Navlink也是用来做路由跳转的，可以完全取代 link ，比link多了个css高亮的效果，默认类名为active
//解构Navlink组件
    import {  NavLink } from "react-router-dom";
//使用的时候需要精准匹配
    <li><NavLink to="/home" exact >home</NavLink></li>  
//使用activeClassName属性修改默认类名
   <li><NavLink to="/home" exact activeClassName = "abc" >home</NavLink></li>   
//使用activeStyle属性修改选中时样式
   <li><NavLink to="/home" exact activeStyle = {{color : red }} >home</NavLink></li>   
```

### 路由传参
```javascript
1、动态参数    
// props.match.params.id
    
2、url传参   
    <Link to="/topics/2" search:"?a=3&b=4" >About</Link>
//使用H5自带的URLSearchParams中的get()方法去匹配取出参数
    const About = (props) => {
      const {
        location: { search },
      } = props;
      const a = new URLSearchParams(search);
      console.log(a.get("a"));
      return <div>about</div>;
    };
     
3、state传参  
    <Link to="/topics/2" state:{msg:"hello"} >Topics2</Link>
//在该传参的组件中打印 props.location 获取参数
    const Topics = (props) => {
      console.log(props.location);
      return <div>Topics</div>;
    };
```

### 监听路由变化
```javascript
如果你使用的是React Router v4或v5，可以通过history对象来监听路由变化。

history.listen(location => {
  console.log(location.pathname); // 打印当前路由路径
});
```

```plain
import { useHistory, useLocation } from 'react-router-dom';

function MyComponent() {
  let history = useHistory();
  let location = useLocation();

  useEffect(() => {
    console.log('路由变化:', location.pathname);
  }, [location]);

  // 你可以使用history对象来编程式导航
  const handleNavigate = () => {
    history.push('/new-path');
  };

  return (
    <button onClick={handleNavigate}>导航到新路径</button>
  );
}

```

### React Router v5 v6 与 v7 核心区别
#### 一、核心架构演进
| **对比维度** | **v5 (2020)** | **v6 (2022)** | **v7 (2024)** |
| :---: | :---: | :---: | :---: |
| **底层架构** | 传统前端路由架构 | 增强版前端路由架构 | 全栈框架架构（整合 Remix） |
| **包结构** | 分离包：`react-router-dom`+ `react-router-native` | 分离包：`react-router-dom`+ `react-router-native` | 合并单一包 `react-router` |
| **类型系统** | 需手动定义类型 | 自动生成路由模块类型定义 | 完整类型支持 + 泛型增强 |
| **框架支持** | 仅支持客户端渲染 | 支持客户端渲染 | 原生支持 SSR/SSG/WSS（Web Standards） |


---

#### 二、核心功能对比
###### 路由声明与加载
| **特性** | **v5** | **v6** | **v7** |
| :---: | :---: | :---: | :---: |
| **路由容器** | `<BrowserRouter>`/ `<HashRouter>` | `<BrowserRouter>`/ `<HashRouter>` | `<RouterProvider>` |
| **路由匹配** | `<Switch>`+ `exact`属性 | `<Routes>`+ 默认精确匹配 | `<Routes>`+ 智能路径解析 |
| **动态路由** | `component`/`render`属性 | `element`属性 | `loader`/`action`函数 + `Outlet`组件 |
| **编程式导航** | `useHistory().push()` | `useNavigate()` | `useNavigation()`+ 异步状态管理 |


###### 数据获取与表单
| **特性** | **v5** | **v6** | **v7** |
| :---: | :---: | :---: | :---: |
| **数据获取** | 无内置机制 | `loader`/`action`基础实现 | `Loader Function`+ `Fetcher Pattern`+ 缓存策略 |
| **表单提交** | 需配合 `fetch`或第三方库 | 基础表单支持 | 原生 `<Form>`组件 + 自动编码 + 乐观更新 |
| **错误处理** | 需手动实现 | 需手动实现 | `ErrorElement`+ 全局错误边界 |


###### 性能优化
| **特性** | **v5** | **v6** | **v7** |
| :---: | :---: | :---: | :---: |
| **代码分割** | 依赖 `React.lazy`+ `Suspense` | 增强版动态导入 | 模块级懒加载（Route Modules） |
| **预加载策略** | 无原生支持 | 实验性 `prefetch` | 智能预加载（基于用户行为预测） |
| **Tree Shaking** | 有限 | 部分支持 | 完全支持 |


#### 三、API 变更对比
###### 废弃 API (v6+ 移除)
| **v5 API** | **v6 替代方案** | **v7 增强特性** |
| :---: | :---: | :---: |
| `Redirect` | `Navigate`组件 | `redirect()`函数 + 状态码控制 |
| `withRouter` | Hooks (`useLocation/useParams`) | 自动注入路由上下文 |
| `useHistory` | `useNavigate` | 支持异步导航 + 状态管理 |
| `Switch` | `Routes` | 嵌套路由自动拼接路径 |


###### 新增核心 API
| **v6 特性** | **功能描述** | **v7 增强** |
| :---: | :---: | :---: |
| `useRoutes` | 通过配置对象定义路由 | 支持动态路由生成 + 类型安全 |
| `Outlet` | 嵌套路由的占位符 | 自动处理嵌套布局 + 错误边界集成 |
| `loader`/`action` | 路由级数据获取与提交 | 支持流式传输 + 中间件 |
| `createBrowserRouter` | 服务端渲染专用 API | 整合 Remix 的全栈能力 |




