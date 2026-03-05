---
title: "ECMAScript 6 常用部分"
sidebar_position: 2
---

# 基础概念
##### 导入导出（CommonJS规范和ES6规范）
```javascript
一些区别：
(1) CommonJS模块是运行时加载（动态导入），ES6模块是编译时输出（默认静态导入，可通过import()函数实现动态加载）
(2) CommonJS模块输出的是一个值的复制，ES6模块输出的是值的引用（live binding）
(3）CommonJS加载的是整个模块，即将所有的方法全部加载进来，ES6可以单独加载其中的某个方法
(4) CommonJS中this指向当前模块，ES6中this指向undefined
(5) CommonJS默认非严格模式（除非显式声明），ES6的模块自动采用严格模式
(6) CommonJS的Tree Shaking依赖打包工具实现，ES6的Tree Shaking支持静态分析

ES6动态导入可以使用预获取（prefetch）、预加载（preload）加载技术。
  在浏览器中表现为：<link rel="preload" href="/main.js?t=3000" as="script">
  在js中表现问：import(/* webpackPreload */ './**.js').then(()=>{});
```

##### let和const
```javascript
都用来申明块级作用域（声明的变量在当前{}有效）的变量，不会申明提前； 
ES6中通过const定义常量，常量通常用大写字母定义，多个单词之间用_分隔; 
const声明的变量只允许一次赋值（基本数据类型）操作，引用情况下不能修改引用对象，但是可以修改对象属性； 
let和const在变量声明预编译阶段存在TDZ暂时性死区（var 不存在）； 
let和const在声明的变量不会绑定到window中（wiindow.a);
```

##### let 和 var 的区别
```javascript
没有全局污染
let是块级作用域
let存在暂时性死区（TDZ）
let不可以重复声明
```

##### 箭头函数-消除原本函数的二义性
```javascript
ES6新增函数语法糖（指令序列） - 简化函数写法；
  当形参只有一个时，可以省略();
  当内容只有一条语句且为return时，可以省略return和{}，;
  当返回一个对象时，需要加 ( ) ； 
脱离了面向对象的范畴，
  this在箭头函数中，指向静态（固定、父级环境），指向被调用者当前定义时的环境；
  箭头函数没有原型（ prototype 指向 undefind )；
消除原本函数的二义性（函数可以直接执行，也可以创建实例）。
```

##### 使用 class 创建类-消除原本函数的二义性
```javascript
旧：	
  class Car {
 		 constructor() {
   	 	this.color = 'blue';
    	this.age = 2;
  		}
		}

ES2022新：	
  class Car {
  	color = 'blue';
  	age = 2;
   	#firstName = 'Joseph';        // 私有变量 使用in来判断某个对象是否拥有某个私有属性
   	hasColor() {
   	 return #firstName in this;   //console.log(car.hasColor()); // true
  	}
	}
```

##### 解构赋值-结构相同
```javascript
从数组和对象中提取值，对变量进行赋值；
本质是左右相等的一种匹配模式进行赋值；
它要求赋值符左右两边的结构相同；
解构将自动拆解，不停调用 Object.iterator().next 方法，获取可迭代对象的值，对应赋值；
展开运算符：...   结构时出现在变量身上为收缩，无法取值时获取空数组；
变量解构时，需要变量与属性名一致；
  let { foo: baz } = { foo: 'aaa', bar: 'bbb' };
  baz // "aaa"

交换变量 ：[a,b]=[b,a]    
```

```javascript
只要一个数据结构身上，具有[Symbol.iterator]这样一个属性，且值是一个函数体，可以返回一个迭代器的话，我们就称这个数据结构是可迭代的；
人为的为对象打造一个迭代器出来，也就是让对象的隐式原型可以继承到迭代器属性：

Object.prototype[Symbol.iterator] = function(){
    // 使用 Object.values(this) 方法获取对象的所有值，并返回这些值的迭代器对象
    return Object.values(this)[Symbol.iterator]()
}

var [a, b] = {a: 1, b: 2}
console.log(a,b);
```

##### 空值合并运算符（ ?? ）
```javascript
逻辑操作符，当左侧的操作数为 null或者undefined时，返回其右侧操作数，否则返回左侧操作数。
  const foo = undefined ?? "foo"   =>   foo
  const bar = null ?? "bar"        =>   bar
  const str = '' ?? "bar"          =>   ''
```

##### 模板字符串（template string）
```javascript
是一种字符串格式，用 `` 表示；可以作为普通字符串使用，也可以定义多行字符串；
1、可以保留字符串原有格式，类似于标签<pre></pre>;
2、允许字符串换行；
3、变量拼接更加便利:`abc${}`;
```

##### 获取全局对象 globalThis
```javascript
从不同的 JavaScript 环境中获取全局对象需要不同的语句。在 Web 中，可以通过 window、self 取到全局对象，在 Node.js 中，它们都无法获取，必须使用 global。
在松散模式下，可以在函数中返回 this 来获取全局对象，但是在严格模式和模块环境下，this 会返回 undefined。

以前获取全局this：
  var getGlobal = function () {
    if (typeof self !== 'undefined') { return self; }
    if (typeof window !== 'undefined') { return window; }
    if (typeof global !== 'undefined') { return global; }
    throw new Error('unable to locate global object');
  };

  var globals = getGlobal();

  if (typeof globals.setTimeout !== 'function') {
    // 此环境中没有 setTimeout 方法！
  }

现在获取全局this：
  if (typeof globalThis.setTimeout !== 'function') {
    //  此环境中没有 setTimeout 方法！
  }
```

# 数据类型
##### set数据结构
```javascript
ES6新增，类似于数组，有序结构，不同于数组的是，成员唯一（不可重复）；
引用类型数据，有构造函数：let set = new set([]);
数组的去重：
    var arr2 = [... new Set(arr)];         //...为展开运算；Set为ES6新增数据结构，不能有相同元素；
转为数组：
    let arr = Array.from(set); 
方法：
set.protopyte.add():向数组中添加元素，出现在set结尾处，如果元素存在则忽略；返回值set对象；
set.protopyte.delete():用于删除set中的指定元素，返回值是布尔值，表示是否删除成功；
set.protopyte.size():返回set元元素数量；
set.protopyte.has():判断set中是否具有某个值，返回值是布尔值；
set.protopyte.clear():清空、删除所有元素；
```

##### map数据结构
```javascript
类似于对象的哈希结构，提供了值-值得对应；
map的键可以是任意数据类型；
let map = new map();
设置对象的值：map.set(key,value);
获取对象的值:map.get(key);
判断成员是否存在：map.has(key);
删除对象的值：map.delete(key);
清空：map.clear();
```

##### 基本数据类型-symbol
```javascript
ES中第六种数据类型-解决对象属性命名重复问题，但是普通方法无法遍历（symbol方法可以遍历取出）；
没有构造函数，需要symbol类型时用symbol函数创建；
let uname = symbol(username);
let o ={};
    o[uname] = 'zhangsan';
    console.log(o[uname]);
```

##### Iterator和for...of遍历
```javascript
Iterator 的作用有三个：
  一是为各种数据结构，提供一个统一的、简便的访问接口；
  二是使得数据结构的成员能够按某种次序排列；
  三是 ES6 创造了一种新的遍历命令 for...of 循环，Iterator 接口主要供 for...of 消费。
Iterator 的遍历过程是这样的:
（1）创建一个指针对象，指向当前数据结构的起始位置。也就是说，遍历器对象本质上，就是一个指针对象。
（2）第一次调用指针对象的next方法，可以将指针指向数据结构的第一个成员。
（3）第二次调用指针对象的next方法，指针就指向数据结构的第二个成员。
（4）不断调用指针对象的next方法，直到它指向数据结构的结束位置。
每一次调用next方法，都会返回数据结构的当前成员的信息。具体来说，就是返回一个包含value和done两个属性的对象。其中，value属性是当前成员的值，done属性是一个布尔值，表示遍历是否结束。
  for...of:能遍历的内容必须有Iterator接口；
  遍历数组：
  let set = new set([1,2,3])
  for (let value of set){
    console.log(value);
  }
使用 for...of 遍历map获得数组（第一个元素为key，第二个元素为value）:
  解构赋值：for(let[key,value] of map){
     console.log(key,value);
  }
原生具备 Iterator 接口的数据结构如下:Array、Map、Set、String、TypedArray、函数的 arguments 对象、NodeList 对象。
```

##### 如何使得任何 JavaScript 对象都具有迭代能力
```javascript
Object.prototype[Symbol.iterator] = function(){
    // 使用 Object.values(this) 方法获取对象的所有值，并返回这些值的迭代器对象
    return Object.values(this)[Symbol.iterator]()
}
```

# 异步方案
##### Gnerator
```javascript
ES6新增遍历器对象；异步编程解决方案，让异步代码同步执行；一般情况配合co（co.js）模块使用；本质是一个自执行器；
定义一个Gnerator函数需要在函数名和关键字中添加 * ；
function * hello(){}
Generator 函数是一个普通函数，但是有两个特征:
一是，function关键字与函数名之间有一个星号；
二是，函数体内部使用yield表达式，定义不同的内部状态（yield在英语里的意思就是“产出”）。
调用Generator函数时，表示创建一个遍历器对象，内部包含一个next函数，将函数拆分成多个部分执行，每次执行next函数将运行到下一个yield语句为止；
每次执行next会返回一个对象，返回值包含两个属性：yield表示产出内容，done表示简历是否结束；
```

##### promise
```javascript
所谓Promise，简单说就是一个容器，里面保存着某个未来才会结束的事件（通常是一个异步操作）的结果。
从语法上说，Promise 是一个对象，从它可以获取异步操作的消息。
Promise 提供统一的 API，各种异步操作都可以用同样的方法进行处理。

resolve函数的作用是，将Promise对象的状态从“未完成”变为“成功”（即从 pending 变为 fulfilled(resolved)），在异步操作成功时调用，并将异步操作的结果，作为参数传递出去；
  Promise.resolve = function (value) {
    if(value instanceof Promise) {
      return value
    }
    if (typeof value === 'object' && typeof value.then === 'function') {
      return new Promise((resolve, reject) => {
        value.then(resolve, reject);
      })
    }
    return new Promise((resolve) => resolve(value))
  };

reject函数的作用是，将Promise对象的状态从“未完成”变为“失败”（即从 pending 变为 rejected），在异步操作失败时调用，并将异步操作报出的错误，作为参数传递出去。
  Promise.reject = function (reason) {
    return new Promise((_, reject) => reject(reason))
  };

promise.then（）
  它的作用是为 Promise 实例添加状态改变时的回调函数；如果该对象状态变为resolved(resolved统一只指fulfilled状态)，则会调用then()方法指定的回调函数。

promise.catch（）
  Promise.prototype.catch()方法是.then(null, rejection)或.then(undefined, rejection)的别名，用于指定发生错误时的回调函数；
  如果异步操作抛出错误，状态就会变为rejected，就会调用catch()方法指定的回调函数，处理这个错误。

  Promise.prototype.catch = function (onReject) {
    return this.then(undefined, onReject);
  };

promise.finally()
  finally()方法用于指定不管 Promise 对象最后状态如何，都会执行的操作。该方法是 ES2018 引入标准的；使用场景：不管成功或者失败，都需要执行的代码（loading关闭）

Promise.all()
  Promise.all()方法用于将多个 Promise 实例，包装成一个新的 Promise 实例。
  const p = Promise.all([p1, p2, p3])。

  Promise.myAll = function (promises) {
    let res, rej;
    const p = new Promise((resolve, reject) => {
      res = resolve;
      rej = reject;
    });
    let i = 0;
    let result = [];
    for (const item of promises) {
      const index = i;
      i++;
      Promise.resolve(item).then((data) => {
        result[index] = data;
        i--;
        if (i === 0) {
          res(result)
        }
      }, rej)
    }
    if (i === 0) {
      res([])
    }
    return p
  }
```

##### async/await函数
```javascript
function isAsyncFunction(func) {
  return typeof func === 'function' && func.constructor.name === 'AsyncFunction';
}

function isAsyncFunction(func) {
  return Object.prototype.toString.call(func) === '[object AsyncFunction]';
}

function isAsyncFunction(func) {
  return func.toString().includes('async');
}
```

##### 控制大规模请求实例
```javascript
const urls = ["url1", "url2", ... ,"url100"]; 
const maxConcurrentNum = 10; // 最大并发数 
// 数组分块，chunk表示每批次数量，返回数组二维数组 
function chunk(arr, chunk) { 
  let result = []; 
  for (let i = 0, len = arr.length; i < len; i += chunk) { 
    result.push(arr.slice(i, i + chunk)); 
   } 
   return result; 
 }

// 异步请求方法 
function fetchUrl(url) { 
  return new Promise((resolve, reject) => { 
    fetch(url) 
      .then(res => resolve(res)) 
      .catch(err => reject(err)); 
     }); 
   }

// 对url数组进行分块处理
const chunkedUrls = chunk(urls, maxConcurrentNum);

(async function () {
  try {
    for (let urls of chunkedUrls) {
      const promises = urls.map(url => fetchUrl(url));
      // 等待所有promises完成执行，并将结果存入results数组中
      const results = await Promise.all(promises);
      console.log('results:', results);
    }
  } catch (err) {
   console.error(err);
  }
})();
```

```javascript
const promiselist = [];
for (let i = 0; i < 100; i++) {
  const promise = fetch(`https://example.com/data${i}.json`);
  promiselist.push(promise);
}
Promise.race(promiselist)
  .then(response => {
    // handle the fastest response here
  })
  .catch(error => {
    console.error(error);
  });
```

##### 手写promise
```javascript
function myPromise(excutor) {
    // 1、执行结构
    let self = this;
    self.status = 'pending';
    self.value = null; // 成功结果
    self.reason = null;// 失败原因
    // 6、添加缓存数组
    self.onFulfilledCallbacks = [];
    self.onRejectedCallbacks = [];

    // 4、判断状态作相应处理
    function resolve(value) {
        if (self.status === 'pending') {
            self.value = value; // 保存成功结果
            self.status = 'fulfilled';
            // 8、状态改变依次取出callback
            self.onFulfilledCallbacks.forEach(item => item(value))
        }
    };
    function reject(reason) {
        if (self.status === 'pending') {
            self.reason = reason; // 保存失败原因
            self.status = 'rejected';
            // 8、状态改变依次取出callback
            self.onRejectedCallbacks.forEach(item => item(reason))
        }
    };

    // 3、执行
    try {
        excutor(resolve, reject)
    } catch (error) {
        reject(error)
    };


}
// 2、then方法
myPromise.prototype.then = function (onFulfilled, onRejected) {
    let self = this;
    // 5、状态改变调用then方法
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : function (data) { resolve(data) };
    onRejected = typeof onRejected === 'function' ? onRejected : function (err) { throw err };

    // 7、添加callback
    // if (self.status === 'pending') {
    // self.onFulfilledCallbacks.push(onFulfilled);
    // self.onRejectedCallbacks.push(onRejected);
    // }
    if (self.status === 'fulfilled') {
        return new myPromise((resolve, reject) => {
            try {
                let res = onFulfilled(self.value);
                // 判断传入的值是不是Promise ，是就.then 不是就抛出结果
                res instanceof myPromise ? res.then(resolve, reject) : resolve(x);
            }
            catch (err) {
                reject(err)
            }
        })
    };
    if (self.status === 'rejected') {
        return new myPromise((resolve, reject) => {
            try {
                let res = onRejected(self.value);
                // 判断传入的值是不是Promise ，是就.then 不是就抛出结果
                res instanceof myPromise ? res.then(resolve, reject) : resolve(x);
            }
            catch (err) {
                reject(err)
            }
        })
    };
    if (self.status === 'pending') {
        return new myPromise((resolve, reject) => {
            self.onFulfilledCallbacks.push(() => {
                let res = onRejected(self.value);
                // 判断传入的值是不是Promise ，是就.then 不是就抛出结果
                res instanceof myPromise ? res.then(resolve, reject) : resolve(x);
            });
            self.onRejectedCallbacks.push(() => {
                let res = onRejected(self.value);
                // 判断传入的值是不是Promise ，是就.then 不是就抛出结果
                res instanceof myPromise ? res.then(resolve, reject) : resolve(x);
            });
        })
    }
}
myPromise.prototype.catch = function (fn) {
    return this.then(null, fn)
}
```

# 对象的基本方法
**Proxy**（ES6）

```javascript
代理整个对象，拦截包括属性访问、赋值、删除、函数调用等 13 种操作，提供更细粒度的控制，用于拦截对象的所有基本方法

const proxy = new Proxy(target, {
  get(target, prop) { console.log('读取属性'); },
  set(target, prop, value) { console.log('设置属性'); }
});
```

##### get 捕捉器（常用）
```javascript
 const obj = {
    name: "copyer",
    age: 12,
 };
 const objProxy = new Proxy(obj, {
     /**
      * @param {*} target :目标对象
      * @param {*} key : 键值
      * @param {*} receiver ：代理对象（后面会专门讲解）
      */
     get: function (target, key, receiver) {
       console.log("get捕捉器");
       return target[key];
     },
 });
 console.log(objProxy.name); // copyer
```

##### set 捕捉器（常用）
```javascript
 const obj = {
   name: "copyer",
   age: 12,
 };
 const objProxy = new Proxy(obj, {
   /**
    * @param {*} target : 目标对象
    * @param {*} key ：键值
    * @param {*} newValue ：新增
    * @param {*} receiver ：代理对象
    */
   set: function (target, key, newValue, receiver) {
     console.log("set捕捉器");
     target[key] = newValue;
   },
 });
 objProxy.age = 23;
 console.log(obj.age); // 23
```

##### has 捕捉器（常用）
```javascript
 const obj = {
   name: "copyer",
   age: 12,
 };
 const objProxy = new Proxy(obj, {
   has: function (target, key) {
     console.log("has捕捉器");
     return Object.keys(target).includes(key);
   },
 });
 console.log("name" in objProxy);
```

##### deleteProperty 捕捉器（常用）
```javascript
 const obj = {
   name: "copyer",
   age: 12,
 };
 const objProxy = new Proxy(obj, {
   deleteProperty: function (target, key) {
     console.log("deleteProperty捕捉器");
     return delete target[key];
   },
 });
 console.log(delete objProxy.name); // true
```

##### **Object.defineProperty**（ES5）
```javascript
[[DefineOwnProperty]] 是一个内部方法，不在JavaScript代码中直接调用，而是作为 Object.defineProperty 的底层实现。
Object.defineProperty 是JavaScript的一个内置方法，用于在一个对象上定义一个新的属性或更改现有属性的特性，同时不会触发属性的存取器（getter/setter）。

let obj = {};
// 定义一个只读属性
Object.defineProperty(obj, 'readOnlyProp', {
  value: 'This is a read-only property.',
  writable: false, // 不可写
  enumerable: true, // 可枚举
  configurable: false // 不可配置
});
```

